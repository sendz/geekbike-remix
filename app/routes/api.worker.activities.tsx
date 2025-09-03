import { json, LoaderFunctionArgs } from "@remix-run/server-runtime";
import moment from "moment-timezone"
import { StravaActivity } from "~/types/StravaActivity.type";
import { v7 } from "uuid"
import { sumByAthlete } from "~/utils/sumByAthlete";
import { getValidAccessToken } from "~/auth.server";
import { getActivities } from "~/utils/strava";

export type FetchActivitiesParams = {
  before?: number
  after?: number
  page?: number
  per_page?: number
  range?: "today" | "day" | "week" | "month"
}

export async function action(args: LoaderFunctionArgs) {
  const {context, request} = args
  let env = context.cloudflare.env

  const header = request.headers

  if (!header.get('Authorization') || (header.get('Authorization')?.split('Bearer ')[1] !== env.API_SECRET_KEY)) {
    throw json({ status: 'Unauthorized' }, { status: 401 })
  }

  let afterTime = moment()

  const data = await getActivities(args)

  console.log("RESPONSE", afterTime, data)

  if (data.length > 0) {
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
        inserted_at,
        activities_number
      )
      VALUES (
        ?, 
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
          moment().toISOString(),
          1
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

  return json({
    message: `No Records created`
  }, { status: 404 })
}