import { LoaderFunctionArgs } from "@remix-run/server-runtime";
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

  const response: Array<StravaActivity> = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${env.STRAVA_ACCESS_TOKEN}`
    }
  }).then(resp => resp.json())

  const data = response.filter(activity => activity.sport_type.toLowerCase() === "ride")

  console.log("ACTIVITIES", data.length)

  return data
}