import { getShopifyConfig } from "./config";

export async function shopifyStorefrontGraphQL({
  query,
  variables = {},
  cache = "no-store",
}) {
  const {
    storeDomain,
    storefrontAccessToken,
    storefrontTokenHeader,
    storefrontApiVersion,
  } = getShopifyConfig();

  if (!storefrontAccessToken) {
    throw new Error(
      "Missing Storefront API token. Set SHOPIFY_STOREFRONT_PRIVATE_TOKEN in .env.local. " +
      "Get it from: Shopify Admin -> Sales channels -> Headless -> Storefront API."
    );
  }

  const endpoint = `https://${storeDomain}/api/${storefrontApiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [storefrontTokenHeader]: storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
    cache,
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 404) {
    throw new Error(
      `Storefront API 404 on ${storeDomain}. ` +
      "This usually means: (1) the token is from a different store, or " +
      "(2) the Headless sales channel has not been added in Shopify Admin yet. " +
      "Go to Shopify Admin -> Sales channels -> Add -> Headless, then copy the Storefront API private token."
    );
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `Storefront API auth failed (${response.status}) on ${storeDomain}. ` +
      "Regenerate the Storefront API private token in Shopify Admin -> Sales channels -> Headless."
    );
  }

  if (!response.ok || payload.errors) {
    const details = payload.errors ? ` ${JSON.stringify(payload.errors)}` : "";
    throw new Error(`Shopify Storefront API error (${response.status} ${response.statusText}).${details}`);
  }

  return payload.data;
}