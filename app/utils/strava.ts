import moment from "moment-timezone";
import { getValidAccessToken, TokenData } from "~/auth.server";
import { GetStravaActivityType, StravaActivity } from "~/types/StravaActivity.type";
import { compareActivities } from "./compareActivities";

export type FetchActivitiesParams = {
  before?: string
  after?: string
  before_unix?: number
  after_unix?: number
  page?: number
  per_page?: number
  range?: "day" | "week" | "month"
}

export const refreshAccessToken = async (
  env: Env
): Promise<null | TokenData> => {
  const refreshToken = env.STRAVA_REFRESH_TOKEN;
  const clientId = env.STRAVA_CLIENT_ID;
  const clientSecret = env.STRAVA_CLIENT_SECRET;
  const payload = {
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  }

  console.log(payload)
  try {
    const response = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((res) => res.json()) as TokenData;

    console.log("Access token refreshed:", response);
    return response;
  } catch (error: any) {
    console.error("Error refreshing access token:", error.message);
    return null;
  }
};

export const getActivities = async (env: Env, body: FetchActivitiesParams, accessToken: string): Promise<GetStravaActivityType> => {
  try {

    const afterTimeUrl = new URL(`${env.STRAVA_API_URL}/v3/clubs/${env.STRAVA_CLUB_ID}/activities`);
    const beforeTimeUrl = new URL(`${env.STRAVA_API_URL}/v3/clubs/${env.STRAVA_CLUB_ID}/activities`);

    let beforeTime = null
    let afterTime = null

    if (body.range) {
      afterTime = moment().tz("Asia/Jakarta").startOf(body.range).subtract(1, body.range)
      beforeTime = moment().tz("Asia/Jakarta").endOf(body.range).subtract(1, body.range)

      beforeTimeUrl.searchParams.append("before", beforeTime.unix().toString())
      afterTimeUrl.searchParams.append("after", afterTime.unix().toString())
    }

    if (body.before) {
      beforeTime = moment(body.before)
      beforeTimeUrl.searchParams.append("before", moment(body.before, 'YYYY-MM-DDTHH:mm:ssZ').unix().toString())
    }

    if (body.after) {
      afterTime = moment(body.after)
      afterTimeUrl.searchParams.append("after", moment(body.after, 'YYYY-MM-DDTHH:mm:ssZ').unix().toString())
    }

    if (body.before_unix) {
      beforeTimeUrl.searchParams.append("before", body.before_unix?.toString())
    }

    if (body.after_unix) {
      afterTimeUrl.searchParams.append("after", body.after_unix?.toString())
    }

    if (!body.page && !body.per_page) {
      afterTimeUrl.searchParams.append("page", "1");
      afterTimeUrl.searchParams.append("per_page", "100");
    }

    (Object.keys(body)).filter(key => !['range', 'before', 'after'].includes(key)).forEach((key) => {
      afterTimeUrl.searchParams.append(key, (body as any)[key])
    })

    console.log("REQUEST URL", afterTimeUrl.toString());

    const afterTimeResponse = await fetch(afterTimeUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const beforeTimeResponse = await fetch(afterTimeUrl.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    const afterTimeData = await afterTimeResponse.json() as Array<StravaActivity>
    const beforeTimeData = await beforeTimeResponse.json() as Array<StravaActivity>

    console.log("ACTIVITIES", JSON.stringify(beforeTimeResponse), JSON.stringify(afterTimeResponse));

    if (afterTimeResponse.ok && beforeTimeResponse.ok) {
      return {
        data: compareActivities(beforeTimeData, afterTimeData),
        before: beforeTime?.toISOString() || "",
        after: afterTime?.toISOString() || ""
      }
    } else {
      throw new Error(`ERROR: Can't get After or Before Data`)
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}