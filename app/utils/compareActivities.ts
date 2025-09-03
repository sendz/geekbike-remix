import { StravaActivity } from "~/types/StravaActivity.type";


// Generate a key WITHOUT activity name
function activityKey(a: StravaActivity): string {
  return [
    a.athlete.firstname,
    a.athlete.lastname,
    a.sport_type,
    a.distance,
    a.moving_time,
    a.elapsed_time,
    a.total_elevation_gain,
  ].join("|");
}

export function compareActivities(
  before: StravaActivity[],
  after: StravaActivity[]
): StravaActivity[] {
  const beforeMap = new Map(before.map(a => [activityKey(a), a]));
  const commons: StravaActivity[] = [];

  for (const afterActivity of after) {
    const key = activityKey(afterActivity);
    if (beforeMap.has(key)) {
      commons.push(afterActivity);
    }
  }

  return commons;
}
