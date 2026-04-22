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
  COOKIE_RETURN_TO,
} from "@/lib/shopify/customerAuth";

const SHOPIFY_CART_COOKIE = "hb_shopify_cart_id";

function buildNoStoreHeaders() {
  return {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
    Pragma: "no-cache",
    Expires: "0",
  };
}

async function clearAuthSession(request) {
  const appUrl = resolveAppUrl(request);
  const clearOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };

  const response = NextResponse.redirect(`${appUrl}/`);
  const noStoreHeaders = buildNoStoreHeaders();
  Object.entries(noStoreHeaders).forEach(([key, value]) => response.headers.set(key, value));
  response.headers.append("Set-Cookie", serializeCookie(COOKIE_ACCESS_TOKEN, "", clearOpts));
  response.headers.append("Set-Cookie", serializeCookie(COOKIE_REFRESH_TOKEN, "", clearOpts));
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
