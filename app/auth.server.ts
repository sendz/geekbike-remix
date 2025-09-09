import { authCookie } from "./cookie.server";
import { refreshAccessToken } from "./utils/strava";

export type TokenData = {
  token_type: string;
  access_token: string;
  expires_at: number; // unix seconds
  expires_in: number;
  refresh_token: string;
};

// Check validity
function isTokenValid(token: TokenData | null): boolean {
  if (!token) return false;
  const now = Math.floor(Date.now() / 1000); // seconds
  return token.expires_at > now + 60; // give 1 min buffer
}

export async function getValidAccessToken(request: Request, env: Env) {
  const cookieHeader = request.headers.get("Cookie");
  const token = (await authCookie.parse(cookieHeader)) as TokenData | null;

  if (isTokenValid(token)) {
    // ✅ token still valid
    return { accessToken: token!.access_token, setCookie: null };
  }

  // ❌ expired or missing → refresh
  const refreshed = await refreshAccessToken(env);
  if (!refreshed) return { accessToken: null, setCookie: null };

  // save refreshed token into cookie
  const expiresDate = new Date(refreshed.expires_at * 1000);

  const cookieValue = await authCookie.serialize(refreshed, {
    expires: expiresDate,
    maxAge: refreshed.expires_in,
  });

  return {
    accessToken: refreshed.access_token,
    setCookie: cookieValue,
  };
}
