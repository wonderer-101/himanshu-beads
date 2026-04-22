/**
 * GET /api/auth/shopify/logout
 * Clears auth cookies and redirects to homepage.
 */
import { NextResponse } from "next/server";
import {
  getOpenIDConfig,
  resolveAppUrl,
  serializeCookie,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_ID_TOKEN,
  COOKIE_RETURN_TO,
} from "@/lib/shopify/customerAuth";

const SHOPIFY_CART_COOKIE = "hb_shopify_cart_id";

function resolvePostLogoutRedirectUri(appUrl) {
  const configured = (process.env.SHOPIFY_POST_LOGOUT_REDIRECT_URI || "").trim();
  if (configured) return configured;
  return appUrl;
}

function buildNoStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  };
}

async function clearAuthSession(request) {
  const appUrl = resolveAppUrl(request);
  const postLogoutRedirectUri = resolvePostLogoutRedirectUri(appUrl);
  const idToken = request.cookies.get(COOKIE_ID_TOKEN)?.value;
  let redirectTarget = `${appUrl}/`;
  if (idToken) {
    try {
      const openIdConfig = await getOpenIDConfig();
      const endSessionEndpoint = openIdConfig?.end_session_endpoint;
      if (endSessionEndpoint) {
        const logoutUrl = new URL(endSessionEndpoint);
        logoutUrl.searchParams.set("id_token_hint", idToken);
        logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);
        redirectTarget = logoutUrl.toString();
      }
    } catch (error) {
      console.error("[shopify/logout] Failed to prepare hosted logout:", error);
    }
  }

  const clearOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };

  const response = NextResponse.redirect(redirectTarget);
  const noStoreHeaders = buildNoStoreHeaders();
  Object.entries(noStoreHeaders).forEach(([key, value]) => response.headers.set(key, value));
  response.headers.append("Set-Cookie", serializeCookie(COOKIE_ACCESS_TOKEN, "", clearOpts));
  response.headers.append("Set-Cookie", serializeCookie(COOKIE_REFRESH_TOKEN, "", clearOpts));
  response.headers.append("Set-Cookie", serializeCookie(COOKIE_ID_TOKEN, "", clearOpts));
  response.headers.append("Set-Cookie", serializeCookie(COOKIE_RETURN_TO, "", clearOpts));
  response.headers.append("Set-Cookie", serializeCookie(SHOPIFY_CART_COOKIE, "", clearOpts));
  return response;
}

export async function GET(request) {
  return clearAuthSession(request);
}

export async function POST(request) {
  return clearAuthSession(request);
}
