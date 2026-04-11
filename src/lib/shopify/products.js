import { shopifyAdminGraphQL } from "./admin";
import { getShopifyConfig } from "./config";

const IMAGE_NODE_FIELDS = `
  url
  altText
  width
  height
`;

const PRODUCT_LIST_NODE_FIELDS = `
  id
  title
  handle
  featuredImage {
    ${IMAGE_NODE_FIELDS}
  }
  priceRangeV2 {
    minVariantPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_DETAIL_NODE_FIELDS = `
  ${PRODUCT_LIST_NODE_FIELDS}
  description
  descriptionHtml
  tags
  images(first: 12) {
    edges {
      node {
        ${IMAGE_NODE_FIELDS}
      }
    }
  }
  variants(first: 1) {
    edges {
      node {
        id
      }
    }
  }
`;

const PRODUCTS_QUERY = `
  query AdminProducts($first: Int!, $query: String) {
    products(first: $first, query: $query, sortKey: UPDATED_AT, reverse: true) {
      edges {
        node {
          ${PRODUCT_LIST_NODE_FIELDS}
        }
      }
    }
  }
`;

const COLLECTION_PRODUCTS_QUERY = `
  query AdminCollectionProducts($collectionId: ID!, $first: Int!) {
    collection(id: $collectionId) {
      id
      title
      handle
      products(first: $first) {
        edges {
          node {
            ${PRODUCT_LIST_NODE_FIELDS}
          }
        }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query AdminProductByHandle($query: String!) {
    products(first: 1, query: $query) {
      edges {
        node {
          ${PRODUCT_DETAIL_NODE_FIELDS}
        }
      }
    }
  }
`;

function mapImage(image, fallbackAlt) {
  if (!image?.url) {
    return null;
  }

  return {
    url: image.url,
    alt: image.altText || fallbackAlt || "Product image",
    width: image.width || null,
    height: image.height || null,
  };
}

function mapProductSummary(node) {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    image: mapImage(node.featuredImage, node.title),
    price: node.priceRangeV2?.minVariantPrice || null,
  };
}

function normalizeVariantId(variantGid) {
  if (!variantGid) {
    return "";
  }

  const lastPart = variantGid.split("/").pop();
  return /^\d+$/.test(lastPart || "") ? lastPart : "";
}

function mapProductDetail(node) {
  const { storeDomain } = getShopifyConfig();
  const imageMap = new Map();

  const featuredImage = mapImage(node.featuredImage, node.title);
  if (featuredImage?.url) {
    imageMap.set(featuredImage.url, featuredImage);
  }

  node.images?.edges?.forEach(({ node: imageNode }) => {
    const image = mapImage(imageNode, node.title);
    if (image?.url) {
      imageMap.set(image.url, image);
    }
  });

  const images = Array.from(imageMap.values());
  const variantGid = node.variants?.edges?.[0]?.node?.id || "";
  const variantNumericId = normalizeVariantId(variantGid);

  return {
    ...mapProductSummary(node),
    description: node.description || "",
    descriptionHtml: node.descriptionHtml || "",
    tags: node.tags || [],
    images,
    variantGid,
    variantNumericId,
    storeDomain,
    storefrontUrl: `https://${storeDomain}/products/${node.handle}`,
  };
}

export async function getAdminProducts({ limit, query = "", collectionId = "" }) {
  const data = await shopifyAdminGraphQL(
    collectionId
      ? {
          query: COLLECTION_PRODUCTS_QUERY,
          variables: { first: limit, collectionId },
        }
      : {
          query: PRODUCTS_QUERY,
          variables: { first: limit, query: query || undefined },
        }
  );

  if (collectionId && !data.collection) {
    return {
      missingCollection: true,
      collection: null,
      products: [],
    };
  }

  const productEdges = collectionId
    ? data.collection?.products?.edges || []
    : data.products?.edges || [];

  return {
    missingCollection: false,
    collection: collectionId
      ? {
          id: data.collection.id,
          title: data.collection.title,
          handle: data.collection.handle,
        }
      : null,
    products: productEdges.map(({ node }) => mapProductSummary(node)),
  };
}

export async function getAdminProductByHandle(handle) {
  const normalizedHandle = handle?.trim().toLowerCase();
  if (!normalizedHandle) {
    return null;
  }

  const data = await shopifyAdminGraphQL({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { query: `handle:${normalizedHandle}` },
  });

  const nodes = data.products?.edges?.map(({ node }) => node) || [];
  const matchedNode =
    nodes.find((node) => node.handle?.toLowerCase() === normalizedHandle) || nodes[0] || null;

  if (!matchedNode) {
    return null;
  }

  return mapProductDetail(matchedNode);
}
