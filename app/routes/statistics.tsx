import { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { Activity } from "~/types/Activity.type";
import moment, { Moment } from "moment-timezone";
import { sumByAthlete } from "~/utils/sumByAthlete";
import { useEffect } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "Geek Bike Community Leaderboard" },
    { name: "description", content: "Geek Bike Community Indonesia" },
  ];
};

export async function loader({ context, request }: LoaderFunctionArgs): Promise<Array<Activity>> {
  const url = new URL(request.url);
  const month = url.searchParams.get("month"); // format: YYYY-MM

  let query = `
    SELECT id, athlete_name, distance, moving_time, elapsed_time, total_elevation_gain, activity_date, activities_number
    FROM activities
  `;

  if (month) {
    // D1 (SQLite) supports strftime
    query += ` WHERE strftime('%Y-%m', activity_date) = ?`;
  }

  query += ` ORDER BY date(activity_date) ASC, distance DESC`;

  const { results } = month
    ? await context.cloudflare.env.db.prepare(query).bind(month).all()
    : await context.cloudflare.env.db.prepare(query).all();
  return sumByAthlete(results as Array<Activity>) as Array<Activity>
}

const StatisticsIndex = () => {
  const results = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedMonth = searchParams.get("month") || moment().format("YYYY-MM");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchParams({ month: e.target.value });
  };

  const start = moment("2025-07-01"); // starting from July 2025
  const end = moment(); // today

  const months: { label: string; value: string }[] = [];

  // Generate months from start to end
  const current = start.clone();
  while (current.isSameOrBefore(end, "month")) {
    months.push({
      label: current.format("MMMM YYYY"),
      value: current.format("YYYY-MM"),
    }); // e.g., July 2025
    current.add(1, "month");
  }

  useEffect(() => {
    setSearchParams({ month: moment().format('YYYY-MM') })
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <div className="navbar bg-base-100 shadow-sm">
        <a className="btn btn-ghost text-xl" href="/statistics">Geek Bike Community Leaderboard</a>
      </div>
      <div className="w-5xl mx-auto mt-16">
        <div className="flex flex-row justify-end my-8">
          <select className="select"
            value={selectedMonth}
            onChange={handleChange}
          >
            <option value="disabled" disabled>Select Month</option>
            {months.reverse().map((month) => (
              <option key={month.value} value={month.value} selected={month.value === moment().format("YYYY-MM")}>
                {month.label}
              </option>
            ))}
          </select>
        </div>
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