export type StravaActivity = {
  resource_state: number
  athlete: Athlete
  name: string
  distance: number
  moving_time: number
  elapsed_time: number
  total_elevation_gain: number
  type: string
  sport_type: string
  workout_type: any
}

export type Athlete = {
  resource_state: number
  firstname: string
  lastname: string
}
