import { json, LoaderFunctionArgs } from "@remix-run/server-runtime";
import moment from "moment-timezone"
import { StravaActivity } from "~/types/StravaActivity.type";

export type FetchActivitiesParams = {
  before?: number
  after?: number
  page?: number
  per_page?: number
  range?: "day" | "week" | "month"
}

export async function action({
  context, request
}: LoaderFunctionArgs) {
  let env = context.cloudflare.env

  const url = new URL(`${env.STRAVA_API_URL}/v3/clubs/${env.STRAVA_CLUB_ID}/activities`);

  const body = await request.json() as FetchActivitiesParams
  const header = request.headers

  console.log('HEADERS', header)

  if (!header.get('Authorization') || (header.get('Authorization')?.split('Bearer ')[1] !== env.API_SECRET_KEY)) {
    throw json({ status: 'Unauthorized'}, { status: 401})
  }

  if (body.range) {
    const afterTime = moment().tz("Asia/Jakarta").startOf(body.range).subtract(1, body.range)

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
      'Authorization': `Bearer ${env.STRAVA_ACCESS_TOKEN}`
    }
  })

  const data =  await response.json() as Array<StravaActivity>

  console.log("ACTIVITIES", response)

  if (response.ok) {
    return json(data.filter(activity => activity.sport_type.toLowerCase() === "ride"))
  }

  return json(data, { status: response.status })
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { results } = await context.cloudflare.env.db.prepare(
    `SELECT id, athlete_name, distance, moving_time, elapsed_time, total_elevation_gain, activity_date FROM activities`
  ).all()

  return json(results)
}