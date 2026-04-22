/**
 * GET /api/auth/shopify/logout
 * Clears auth cookies and redirects to homepage.
 */
import { NextResponse } from "next/server";
import {
  resolveAppUrl,
  serializeCookie,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  COOKIE_ID_TOKEN,
  COOKIE_RETURN_TO,
} from "@/lib/shopify/customerAuth";

const SHOPIFY_CART_COOKIE = "hb_shopify_cart_id";

function normalizeReturnTo(value) {
  const target = String(value || "").trim();
  if (!target.startsWith("/")) return "/";
  if (target.startsWith("//")) return "/";
  if (/[\r\n]/.test(target)) return "/";
  return target;
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
  const requestUrl = new URL(request.url);
  const returnTo = normalizeReturnTo(requestUrl.searchParams.get("return_to"));
  const redirectTarget = `${appUrl}${returnTo}`;

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
