import { StravaActivity } from "~/types/StravaActivity.type";

export const sumByAthlete = (activities: StravaActivity[]): StravaActivity[] => {
  const map = new Map<string, StravaActivity>();

  for (const act of activities) {
    if (act.sport_type.toLowerCase() !== "ride") continue; // only Ride

    const key = `${act.athlete.firstname} ${act.athlete.lastname}`;
    if (!map.has(key)) {
      map.set(key, {
        athlete: {
          resource_state: act.resource_state,
          firstname: act.athlete.firstname,
          lastname: act.athlete.lastname,
        },
        distance: 0,
        moving_time: 0,
        elapsed_time: 0,
        total_elevation_gain: 0,
        resource_state: act.resource_state,
        name: act.name,
        type: act.type,
        sport_type: act.sport_type,
        workout_type: undefined
      });
    }

    const entry = map.get(key)!;
    entry.distance += act.distance;
    entry.moving_time += act.moving_time;
    entry.elapsed_time += act.elapsed_time;
    entry.total_elevation_gain += act.total_elevation_gain;
  }

  return Array.from(map.values());
}