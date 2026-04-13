/**
 * GET /api/auth/shopify/logout
 * Clears auth cookies and redirects to homepage.
 */
import { NextResponse } from "next/server";
import {
  serializeCookie,
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from "@/lib/shopify/customerAuth";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const clearOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };

  const response = NextResponse.redirect(`${appUrl}/`);
  response.headers.append("Set-Cookie", serializeCookie(COOKIE_ACCESS_TOKEN, "", clearOpts));
  response.headers.append("Set-Cookie", serializeCookie(COOKIE_REFRESH_TOKEN, "", clearOpts));
  return response;
}