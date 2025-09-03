import { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { Activity } from "~/types/Activity.type";
import moment from "moment-timezone";
import { sumByAthlete } from "~/utils/sumByAthlete";

export const meta: MetaFunction = () => {
  return [
    { title: "Geek Bike Community Leaderboard" },
    { name: "description", content: "Geek Bike Community Indonesia" },
  ];
};

export async function loader({ context }: LoaderFunctionArgs): Promise<Array<Activity>> {
  const { results } = await context.cloudflare.env.db.prepare(`
    SELECT id, athlete_name, distance, moving_time, elapsed_time, total_elevation_gain, activity_date, activities_number 
    FROM activities 
    ORDER BY date(activity_date) ASC, distance DESC
    `).all()

  return sumByAthlete(results as Array<Activity>) as Array<Activity>
}

const StatisticsIndex = () => {
  const results = useLoaderData<typeof loader>();

  console.log(results)
  return (
    <div className="flex flex-col min-h-screen">
      <div className="navbar bg-base-100 shadow-sm">
        <a className="btn btn-ghost text-xl" href="/statistics">Geek Bike Community Leaderboard</a>
      </div>
      <div className="w-5xl mx-auto mt-16">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Recorded Date</th>
              <th>Name</th>
              <th>Total Distance (km)</th>
              <th>Moving Time</th>
              <th>Elapsed Time</th>
              <th>Elevation Gain</th>
              <th>Activities</th>
            </tr>
          </thead>
          <tbody>
{results.map(data => (
          <tr>
            <td>{moment(data.activity_date).tz("Asia/Jakarta").format("DD MMM YYYY")}</td>
            <td>{data.athlete_name}</td>
            <td className="text-right">{(data.distance / 1000).toLocaleString("id-ID")}</td>
            <td className="text-right">{moment(data.elapsed_time * 1000).format("HH:mm:ss")}</td>
            <td className="text-right">{moment(data.moving_time * 1000).format("HH:mm:ss")}</td>
            <td className="text-right">{data.total_elevation_gain}</td>
            <td className="text-right">{data.activities_number}</td>
          </tr>
        ))}
          </tbody>
        </table>
        
      </div>
    </div>
  )
}

export default StatisticsIndex;