/**
 * GET /api/auth/shopify/debug
 * Temporary endpoint - shows which env vars are set/missing.
 * REMOVE THIS BEFORE FINAL PRODUCTION LAUNCH.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_ACCESS_TOKEN } from "@/lib/shopify/customerAuth";

export async function GET() {
  const cookieStore = await cookies();
  const hasToken = Boolean(cookieStore.get(COOKIE_ACCESS_TOKEN)?.value);
  const tokenPreview = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value?.slice(0, 12) || null;

  const vars = {
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN || "(NOT SET)",
    SHOPIFY_SHOP_ID: process.env.SHOPIFY_SHOP_ID || "(NOT SET)",
    SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID
      ? process.env.SHOPIFY_CLIENT_ID.slice(0, 8) + "..."
      : "(NOT SET)",
    SHOPIFY_STOREFRONT_PRIVATE_TOKEN: process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN
      ? process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN.slice(0, 8) + "..."
      : "(NOT SET)",
    SHOPIFY_STOREFRONT_API_VERSION: process.env.SHOPIFY_STOREFRONT_API_VERSION || "(NOT SET)",
  };

  const customerApiUrl = process.env.SHOPIFY_STORE_DOMAIN
    ? `https://${process.env.SHOPIFY_STORE_DOMAIN}/account/customer/api/${process.env.SHOPIFY_STOREFRONT_API_VERSION || "2026-04"}/graphql`
    : "(cannot build - SHOPIFY_STORE_DOMAIN missing)";

  return NextResponse.json({
    env: vars,
    customerApiUrl,
    cookiePresent: hasToken,
    tokenPrefix: tokenPreview,
  });
}