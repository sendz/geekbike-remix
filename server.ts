import { createRequestHandler, type ServerBuild } from "@remix-run/cloudflare";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "./build/server"; // eslint-disable-line import/no-unresolved
import { getLoadContext } from "./load-context";
import { getActivities, refreshAccessToken } from "~/utils/strava";
import { v7 } from "uuid";
import moment from "moment-timezone";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleRemixRequest = createRequestHandler(build as any as ServerBuild);

export default {
  async fetch(request, env, ctx) {
    try {
      const loadContext = getLoadContext({
        request,
        context: {
          cloudflare: {
            // This object matches the return value from Wrangler's
            // `getPlatformProxy` used during development via Remix's
            // `cloudflareDevProxyVitePlugin`:
            // https://developers.cloudflare.com/workers/wrangler/api/#getplatformproxy
            cf: request.cf,
            ctx: {
              waitUntil: ctx.waitUntil.bind(ctx),
              passThroughOnException: ctx.passThroughOnException.bind(ctx),
            },
            caches,
            env,
          },
        },
      });
      return await handleRemixRequest(request, loadContext);
    } catch (error) {
      console.log(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },

  async scheduled(event, env, context) {

    let afterTime = moment()
    const token = await refreshAccessToken(env)
    const data = await getActivities(env, { range: "day" }, token?.access_token!)

    console.log("RESPONSE", afterTime, data)

    if (data.length > 0) {
      const addedData = []
      for (const activity of data) {
        try {
          const query = `INSERT INTO activities (
        id, 
        athlete_name, 
        distance, 
        moving_time, 
        elapsed_time, 
        total_elevation_gain, 
        activity_date, 
        inserted_at,
        activities_number
      )
      VALUES (
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?, 
        ?,
        ?
      )`

          const db = await env.db.prepare(query).bind(
            v7(),
            `${activity.athlete.firstname} ${activity.athlete.lastname}`,
            activity.distance,
            activity.moving_time,
            activity.elapsed_time,
            activity.total_elevation_gain,
            afterTime.toISOString(),
            moment().toISOString(),
            1
          )
            .run()

          if (!db.success) {
            throw new Error(db.error)
          }

          addedData.push(activity)
        } catch (e: any) {
          return console.error("CRON: Failed add data", e.message)
        }
      }

      return console.log(
        "Record created", addedData.length
      )
    }

    return console.log(`No Records created`)
  }
} satisfies ExportedHandler<Env>;
