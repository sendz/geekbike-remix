import { AppLoadContext } from "@remix-run/server-runtime";
import { TokenData } from "~/auth.server";

export const refreshAccessToken = async (
  context: AppLoadContext
): Promise<null | TokenData> => {
  const refreshToken = context.cloudflare.env.STRAVA_REFRESH_TOKEN;
  const clientId = context.cloudflare.env.STRAVA_CLIENT_ID;
  const clientSecret = context.cloudflare.env.STRAVA_CLIENT_SECRET;

  try {
    const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    }).then((res) => res.json()) as TokenData;

    console.log("Access token refreshed:", response);
    return response;
  } catch (error: any) {
    console.error("Error refreshing access token:", error.message);
    return null;
  }
};
