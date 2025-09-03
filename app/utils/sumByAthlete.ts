import { Activity } from "~/types/Activity.type";

export const sumByAthlete = (activities: Activity[]): Activity[] => {
  const map = new Map<string, Activity>();

  for (const act of activities) {

    const key = act.athlete_name;
    if (!map.has(key)) {
      map.set(key, {
        athlete_name: act.athlete_name,
        distance: 0,
        moving_time: 0,
        elapsed_time: 0,
        total_elevation_gain: 0,
        activities_number: 0,
        id: `combined-${act.athlete_name}`,
        activity_date: act.activity_date
      });
    }

    const entry = map.get(key)!;
    entry.distance += act.distance;
    entry.moving_time += act.moving_time;
    entry.elapsed_time += act.elapsed_time;
    entry.total_elevation_gain += act.total_elevation_gain;
    entry.activities_number! += 1;
  }

  return Array.from(map.values());
}