import { env } from "cloudflare:workers";

const ENV: Env = env as Env

const refreshToken = ENV.STRAVA_REFRESH_TOKEN;
const clientId = ENV.STRAVA_CLIENT_ID;
const clientSecret = ENV.STRAVA_CLIENT_SECRET;

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response: { data: { access_token: string } } = await fetch('https://www.strava.com/oauth/token', {
      headers: {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }
    }).then(response => response.json());

    const accessToken = response.data.access_token;
    console.log('Access token refreshed:', accessToken);

    return accessToken;
  } catch (error: any) {
    console.error('Error refreshing access token:', error.response ? error.response.data : error.message);
    return null
  }
}
