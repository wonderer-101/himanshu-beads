import { getShopifyConfig } from "./config";

function formatApiError({ status, statusText, errors }) {
  const details = errors ? ` ${JSON.stringify(errors)}` : "";
  return `Shopify Storefront API error (${status} ${statusText}).${details}`;
}

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
      "Missing Storefront API token. Set SHOPIFY_ACCESS_TOKEN or SHOPIFY_STOREFRONT_ACCESS_TOKEN."
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

  if (!response.ok || payload.errors) {
    throw new Error(
      formatApiError({
        status: response.status,
        statusText: response.statusText,
        errors: payload.errors,
      })
    );
  }

  return payload.data;
}
