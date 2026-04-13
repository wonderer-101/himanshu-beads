/**
 * GET /api/auth/shopify/orders
 * Returns the current customer orders from Customer Account API.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_REFRESH_TOKEN,
  refreshAccessToken,
  queryCustomerApi,
} from "@/lib/shopify/customerAuth";

const ORDER_QUERY = `{
  customer {
    orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
      edges {
        node {
          id
          name
          processedAt
          financialStatus
          fulfillmentStatus
          statusPageUrl
          currentTotalPrice { amount currencyCode }
          lineItems(first: 5) {
            edges {
              node {
                title
                quantity
                image { url altText }
                price { amount currencyCode }
              }
            }
          }
        }
      }
    }
  }
}`;

export async function GET(request) {
  try {
    const appUrl = new URL(request.url).origin;
    const cookieStore = await cookies();
    let accessToken = cookieStore.get(COOKIE_ACCESS_TOKEN)?.value;
    const refreshToken = cookieStore.get(COOKIE_REFRESH_TOKEN)?.value;

    if (!accessToken && refreshToken) {
      try {
        const refreshed = await refreshAccessToken(refreshToken, appUrl);
        accessToken = refreshed.accessToken;
      } catch {
        return NextResponse.json({ orders: [] }, { status: 401 });
      }
    }

    if (!accessToken) {
      return NextResponse.json({ orders: [] }, { status: 401 });
    }

    const data = await queryCustomerApi(accessToken, ORDER_QUERY, undefined, appUrl);
    const edges = data?.customer?.orders?.edges || [];
    const orders = edges.map(({ node }) => ({
      id: node.id,
      name: node.name,
      processedAt: node.processedAt,
      financialStatus: node.financialStatus,
      fulfillmentStatus: node.fulfillmentStatus,
      statusPageUrl: node.statusPageUrl,
      totalPrice: node.currentTotalPrice,
      lineItems: node.lineItems?.edges?.map(({ node: li }) => ({
        title: li.title,
        quantity: li.quantity,
        image: li.image,
        price: li.price,
      })) || [],
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[shopify/orders]", err);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
