const DEFAULT_ADMIN_API_VERSION = "2026-01";
const DEFAULT_STOREFRONT_API_VERSION = "2026-01";

function normalizeStoreDomain(storeDomain) {
  if (!storeDomain) return "";

  return storeDomain
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optionalEnv(name) {
  const value = process.env[name];
  return value ? value.trim() : "";
}

export function getShopifyConfig() {
  const sharedAccessToken = optionalEnv("SHOPIFY_ACCESS_TOKEN");
  const adminAccessToken =
    optionalEnv("SHOPIFY_ADMIN_ACCESS_TOKEN") || sharedAccessToken;

  const storefrontPrivateToken = optionalEnv("SHOPIFY_STOREFRONT_PRIVATE_TOKEN");
  const storefrontPublicToken =
    optionalEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN") || sharedAccessToken;
  const storefrontAccessToken = storefrontPrivateToken || storefrontPublicToken;
  const storefrontTokenHeader = storefrontPrivateToken
    ? "Shopify-Storefront-Private-Token"
    : "X-Shopify-Storefront-Access-Token";

  if (!adminAccessToken && !storefrontAccessToken) {
    throw new Error(
      "Missing Shopify access token. Set SHOPIFY_ACCESS_TOKEN or specific Admin/Storefront token env variables."
    );
  }

  return {
    storeDomain: normalizeStoreDomain(requiredEnv("SHOPIFY_STORE_DOMAIN")),
    adminAccessToken,
    storefrontAccessToken,
    storefrontTokenHeader,
    hasAdminAccessToken: Boolean(adminAccessToken),
    hasStorefrontAccessToken: Boolean(storefrontAccessToken),
    adminApiVersion:
      process.env.SHOPIFY_ADMIN_API_VERSION || DEFAULT_ADMIN_API_VERSION,
    storefrontApiVersion:
      process.env.SHOPIFY_STOREFRONT_API_VERSION ||
      DEFAULT_STOREFRONT_API_VERSION,
  };
}
