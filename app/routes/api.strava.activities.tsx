import { json, LoaderFunctionArgs } from "@remix-run/server-runtime";
import { getValidAccessToken } from "~/auth.server";
import { getActivities } from "~/utils/strava";

export type FetchActivitiesParams = {
  before?: number
  after?: number
  page?: number
  per_page?: number
  range?: "day" | "week" | "month"
}

export async function action(args: LoaderFunctionArgs) {
  const header = args.request.headers

  if (!header.get('Authorization') || (header.get('Authorization')?.split('Bearer ')[1] !== args.context.cloudflare.env.API_SECRET_KEY)) {
    throw json({ status: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await args.request.json() as FetchActivitiesParams
    const { accessToken } = await getValidAccessToken(args.request, args.context.cloudflare.env)
    const data = await getActivities(args.context.cloudflare.env, body, accessToken!)
    return json(data)
  } catch (e) {
    console.error(e)
  }
}

export async function loader({ context }: LoaderFunctionArgs) {
  const { results } = await context.cloudflare.env.db.prepare(
    `SELECT id, athlete_name, distance, moving_time, elapsed_time, total_elevation_gain, activity_date, activities_number FROM activities`
  ).all()

  return json(results)
}