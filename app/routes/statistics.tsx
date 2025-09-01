import { json, LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Activity } from "~/types/Activity.type";

export const meta: MetaFunction = () => {
  return [
    { title: "Geek Bike Community Leaderboard" },
    { name: "description", content: "Geek Bike Community Indonesia" },
  ];
};

export async function loader({ context }: LoaderFunctionArgs): Promise<Array<Activity>> {
  const { results } = await context.cloudflare.env.db.prepare(
    `SELECT id, athlete_name, distance, moving_time, elapsed_time, total_elevation_gain, activity_date FROM activities`
  ).all()

  return results as Array<Activity>
}

const StatisticsIndex = () => {
  const results = useLoaderData<typeof loader>();

  console.log(results)
  return (
    <div className="flex flex-col min-h-screen">
      <div className="navbar bg-base-100 shadow-sm">
        <a className="btn btn-ghost text-xl" href="/statistics">Geek Bike Community Leaderboard</a>
      </div>
      <div>
        {results.map(data => (
          <div>
            <p>Name: {data.athlete_name}</p>
            <p>Distance: {data.distance.toLocaleString("id-ID")} meters</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatisticsIndex;