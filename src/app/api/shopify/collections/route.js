import { NextResponse } from "next/server";
import { shopifyAdminGraphQL } from "@/lib/shopify/admin";

const COLLECTIONS_QUERY = `
  query AdminCollections($first: Int!) {
    collections(first: $first, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

function parseLimit(rawLimit) {
  const parsed = Number.parseInt(rawLimit ?? "12", 10);
  if (Number.isNaN(parsed)) return 12;
  return Math.min(Math.max(parsed, 1), 30);
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const limit = parseLimit(url.searchParams.get("limit"));

    const data = await shopifyAdminGraphQL({
      query: COLLECTIONS_QUERY,
      variables: { first: limit },
    });

    const collections =
      data.collections?.edges?.map(({ node }) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description || "",
        image: node.image
          ? {
              url: node.image.url,
              alt: node.image.altText || node.title,
              width: node.image.width,
              height: node.image.height,
            }
          : null,
      })) || [];

    return NextResponse.json({
      ok: true,
      count: collections.length,
      collections,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
