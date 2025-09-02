import { createCookie } from "@remix-run/cloudflare";

export const authCookie = createCookie("auth", {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  path: "/",
});
