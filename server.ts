import { createRequestHandler, type ServerBuild } from "@remix-run/cloudflare";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore This file won’t exist if it hasn’t yet been built
import * as build from "./build/server"; // eslint-disable-line import/no-unresolved
import { getLoadContext } from "./load-context";
import { getActivities } from "~/utils/strava";

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

    const data = await getActivities({
      context: context
    })
    const url = new URL("/api/worker/activities", env.INTERNAL_URL)
    console.log("SCHEDULED:", url)

    context.waitUntil(
      fetch(url.toString(), {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.API_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          range: "day"
        })
      }).then(response => response.json())
        .then(body => console.log("Worker Result", body))
    )
  }
} satisfies ExportedHandler<Env>;
