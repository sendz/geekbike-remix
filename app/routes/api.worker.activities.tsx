import { json, LoaderFunctionArgs } from "@remix-run/server-runtime";
import moment from "moment-timezone"
import { StravaActivity } from "~/types/StravaActivity.type";
import { v7 } from "uuid"
import { sumByAthlete } from "~/utils/sumByAthlete";
import { getValidAccessToken } from "~/auth.server";

export type FetchActivitiesParams = {
  before?: number
  after?: number
  page?: number
  per_page?: number
  range?: "today" | "day" | "week" | "month"
}

export async function action({
  context, request
}: LoaderFunctionArgs) {
  let env = context.cloudflare.env

  const url = new URL(`${env.STRAVA_API_URL}/v3/clubs/${env.STRAVA_CLUB_ID}/activities`);
  const { accessToken } = await getValidAccessToken(request, context)
  
  const body = await request.json() as FetchActivitiesParams
  const header = request.headers

  console.log('HEADERS', header)

  if (!header.get('Authorization') || (header.get('Authorization')?.split('Bearer ')[1] !== env.API_SECRET_KEY)) {
    throw json({ status: 'Unauthorized' }, { status: 401 })
  }

  let afterTime = moment()

  if (body.range) {
    if (body.range === "today") {
      afterTime = moment().tz("Asia/Jakarta").startOf("day")
    } else {
      afterTime = moment().tz("Asia/Jakarta").startOf(body.range).subtract(1, body.range)
    }

    console.log("GET DATE AFTER ", afterTime.toLocaleString())
    url.searchParams.append("after", afterTime.unix().toString())
  }

  if (!body.page && !body.per_page) {
    url.searchParams.append("page", "1");
    url.searchParams.append("per_page", "100");
  }

  (Object.keys(body)).forEach((key) => {
    url.searchParams.append(key, (body as any)[key])
  })

  console.log("REQUEST URL", url.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  const _data = await response.json() as Array<StravaActivity>
  const data = sumByAthlete(_data)

  console.log("RESPONSE", afterTime, data)

  if (response.ok) {
    const addedData = []
    for (const activity of data) {
      try {
        const query = `INSERT INTO activities (
        id, 
        athlete_name, 
        distance, 
        moving_time, 
        elapsed_time, 
        total_elevation_gain, 
        activity_date, 
        inserted_at
      )
      VALUES (
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?
      )`

        const db = await context.cloudflare.env.db.prepare(query).bind(
          v7(),
          `${activity.athlete.firstname} ${activity.athlete.lastname}`,
          activity.distance,
          activity.moving_time,
          activity.elapsed_time,
          activity.total_elevation_gain,
          afterTime.toISOString(),
          moment().toISOString()
        )
          .run()

        if (!db.success) {
          throw new Error(db.error)
        }

        addedData.push(activity)
      } catch (e: any) {
        return json({ message: e.message }, { status: 500 })
      }
    }

    return json({
      message: `Record created: ${addedData.length}`
    })
  }

  return json(response)
}