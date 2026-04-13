/**
 * GET /api/auth/shopify/me
 * Returns the current customer profile from the Customer Account API.
 * Returns 401 if not logged in, 200 with customer data if logged in.
 * Used by the React AuthContext to determine login state on the client.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN, COOKIE_REFRESH_TOKEN, refreshAccessToken, serializeCookie, makeTokenCookieOptions } from "@/lib/shopify/customerAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    let accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

    // If no access token but we have a refresh token, try to refresh
    if (!accessToken && refreshToken) {
      try {
        const refreshed = await refreshAccessToken(refreshToken);
        accessToken = refreshed.accessToken;

        // We'll set the new cookie in the response below
        const response = NextResponse.json(await queryCustomer(accessToken));
        response.headers.append(
          "Set-Cookie",
          serializeCookie(COOKIE_ACCESS_TOKEN, accessToken, makeTokenCookieOptions(refreshed.expiresIn || 86400))
        );
        if (refreshed.refreshToken) {
          response.headers.append(
            "Set-Cookie",
            serializeCookie(COOKIE_REFRESH_TOKEN, refreshed.refreshToken, makeTokenCookieOptions(60 * 60 * 24 * 30))
          );
        }
        return response;
      } catch {
        return NextResponse.json({ customer: null }, { status: 401 });
      }
    }

    if (!accessToken) {
      return NextResponse.json({ customer: null }, { status: 401 });
    }

    const customer = await queryCustomer(accessToken);
    return NextResponse.json({ customer });
  } catch (err) {
    console.error("[shopify/me]", err);
    return NextResponse.json({ customer: null }, { status: 500 });
  }
}

async function queryCustomer(accessToken) {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const apiUrl = `https://${storeDomain}/account/customer/api/2026-01/graphql`;

  const query = `{
    customer {
      id
      firstName
      lastName
      emailAddress { emailAddress }
    }
  }`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query }),
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data?.data?.customer ?? null;
}