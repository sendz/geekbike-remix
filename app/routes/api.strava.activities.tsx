import { LoaderFunctionArgs } from "@remix-run/server-runtime";

export type FetchActivitiesParams = {
  before: number
  after: number
  page: number
  per_page: number
  range: "day" | "week" | "month"
}

export async function loader({
  context,
  params
}: LoaderFunctionArgs) {
  let env = context.cloudflare.env

  const url = new URL(`${env.STRAVA_API_URL}/v3/clubs/${env.STRAVA_CLUB_ID}/activities`);
  const paramKeys: (keyof FetchActivitiesParams)[] = Object.keys(params) as (keyof FetchActivitiesParams)[] || [];

  paramKeys.forEach((key: string) => {
    url.searchParams.append(key, params?.[key!]!.toString())
  });

  console.log("REQUEST URL", url.toString());

  const response: Array<any> = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${env.STRAVA_ACCESS_TOKEN}`
    }
  }).then(resp => resp.json())

  console.log("ACTIVITIES", response.length)

  return response
}