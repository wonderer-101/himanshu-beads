/**
 * GET /api/auth/shopify/me
 * Returns the current customer profile from the Customer Account API.
 * Returns 401 if not logged in, 200 with customer data if logged in.
 * Used by the React AuthContext to determine login state on the client.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  refreshAccessToken,
  serializeCookie,
  makeTokenCookieOptions,
  fetchCustomerProfile,
} from "@/lib/shopify/customerAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;
    let refreshed = null;

    // If no access token but we have a refresh token, refresh first.
    if (!accessToken && refreshToken) {
      try {
        refreshed = await refreshAccessToken(refreshToken);
        accessToken = refreshed.accessToken;
      } catch {
        return NextResponse.json({ customer: null }, { status: 401 });
      }
    }

    if (!accessToken) {
      return NextResponse.json({ customer: null }, { status: 401 });
    }

    // First attempt with existing token
    let customer = await fetchCustomerProfile(accessToken);

    // If token is stale, retry once after refresh
    if (!customer && refreshToken) {
      try {
        refreshed = await refreshAccessToken(refreshToken);
        accessToken = refreshed.accessToken;
        customer = await fetchCustomerProfile(accessToken);
      } catch {
        return NextResponse.json({ customer: null }, { status: 401 });
      }
    }

    if (!customer) {
      return NextResponse.json({ customer: null }, { status: 401 });
    }

    const response = NextResponse.json({ customer });
    if (refreshed?.accessToken) {
      response.headers.append(
        "Set-Cookie",
        serializeCookie(
          COOKIE_ACCESS_TOKEN,
          refreshed.accessToken,
          makeTokenCookieOptions(refreshed.expiresIn || 86400)
        )
      );
      if (refreshed.refreshToken) {
        response.headers.append(
          "Set-Cookie",
          serializeCookie(
            COOKIE_REFRESH_TOKEN,
            refreshed.refreshToken,
            makeTokenCookieOptions(60 * 60 * 24 * 30)
          )
        );
      }
    }

    return response;
  } catch (err) {
    console.error("[shopify/me]", err);
    return NextResponse.json({ customer: null }, { status: 401 });
  }
}
