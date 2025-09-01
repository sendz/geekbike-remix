import { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Geek Bike Community Leaderboard" },
    { name: "description", content: "Geek Bike Community Indonesia" },
  ];
};

const StatisticsIndex = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="navbar bg-base-100 shadow-sm">
        <a className="btn btn-ghost text-xl" href="/statistics">Geek Bike Community Leaderboard</a>
      </div>
    </div>
  )
}

export default StatisticsIndex;