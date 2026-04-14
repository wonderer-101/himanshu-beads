"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthContext";

const STORAGE_KEY = "hb_cart_v1";
const SHOPIFY_CART_ENDPOINT = "/api/shopify/cart";
const FALLBACK_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || "";

const CartContext = createContext(null);

function normalizeQuantity(value, fallback = 1, min = 1) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.min(Math.max(parsed, min), 50);
}

function normalizeStoreDomain(value) {
  return (value || "")
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/+$/, "");
}

function normalizeImage(image) {
  if (!image?.url) {
    return null;
  }

  return {
    url: image.url,
    alt: image.alt || "Product image",
  };
}

function normalizePrice(price) {
  if (!price?.amount || !price?.currencyCode) {
    return null;
  }

  return {
    amount: String(price.amount),
    currencyCode: price.currencyCode,
  };
}

function sanitizeItem(rawItem) {
  const variantNumericId = String(rawItem?.variantNumericId || "").trim();
  if (!/^\d+$/.test(variantNumericId)) {
    return null;
  }

  return {
    variantNumericId,
    id: String(rawItem?.id || ""),
    handle: String(rawItem?.handle || ""),
    title: String(rawItem?.title || "Product"),
    image: normalizeImage(rawItem?.image),
    price: normalizePrice(rawItem?.price),
    storeDomain: normalizeStoreDomain(rawItem?.storeDomain || FALLBACK_STORE_DOMAIN),
    quantity: normalizeQuantity(rawItem?.quantity),
  };
}

function priceToNumber(price) {
  const amount = Number.parseFloat(price?.amount || "");
  return Number.isFinite(amount) ? amount : 0;
}

function mergeItemIntoList(current, incoming) {
  const existingIndex = current.findIndex(
    (item) => item.variantNumericId === incoming.variantNumericId
  );
  if (existingIndex === -1) {
    return [...current, incoming];
  }

  const next = [...current];
  const existing = next[existingIndex];
  next[existingIndex] = {
    ...existing,
    ...incoming,
    quantity: normalizeQuantity(existing.quantity + incoming.quantity),
  };
  return next;
}

function readGuestItems() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => sanitizeItem(item)).filter(Boolean);
  } catch {
    return [];
  }
}

function writeGuestItems(items) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage errors.
  }
}

function clearGuestItems() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function toSyncPayload(items) {
  return items
    .map((item) => ({
      variantNumericId: String(item?.variantNumericId || ""),
      quantity: normalizeQuantity(item?.quantity, 0, 0),
    }))
    .filter((item) => /^\d+$/.test(item.variantNumericId) && item.quantity > 0);
}

export function CartProvider({ children }) {
  const { customer, loading: authLoading } = useAuth();
  const isLoggedIn = Boolean(customer);

  const [items, setItems] = useState([]);
  const [checkoutUrl, setCheckoutUrl] = useState("");
  const [hasHydrated, setHasHydrated] = useState(false);

  const applyShopifyCart = useCallback((cart) => {
    const nextItems = Array.isArray(cart?.items)
      ? cart.items.map((item) => sanitizeItem(item)).filter(Boolean)
      : [];
    setItems(nextItems);
    setCheckoutUrl(String(cart?.checkoutUrl || ""));
  }, []);

  const requestShopifyCart = useCallback(async (method = "GET", payload = null) => {
    const init = { method, cache: "no-store" };
    if (payload !== null) {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify(payload);
    }

    const res = await fetch(SHOPIFY_CART_ENDPOINT, init);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok || !data?.cart) {
      const message = data?.error || `Cart request failed (${res.status})`;
      throw new Error(message);
    }
    return data.cart;
  }, []);

  const reloadShopifyCart = useCallback(async () => {
    try {
      const cart = await requestShopifyCart("GET");
      applyShopifyCart(cart);
    } catch {
      // Keep optimistic client state if refresh fails.
    }
  }, [applyShopifyCart, requestShopifyCart]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let cancelled = false;

    async function initializeCart() {
      setHasHydrated(false);

      if (!isLoggedIn) {
        const guestItems = readGuestItems();
        if (cancelled) return;
        setItems(guestItems);
        setCheckoutUrl("");
        setHasHydrated(true);
        return;
      }

      const guestItems = readGuestItems();
      let synced = false;

      try {
        const cart = guestItems.length
          ? await requestShopifyCart("POST", {
              action: "sync",
              items: toSyncPayload(guestItems),
            })
          : await requestShopifyCart("GET");
        synced = true;
        if (cancelled) return;
        applyShopifyCart(cart);
      } catch {
        if (cancelled) return;
        setItems([]);
        setCheckoutUrl("");
      } finally {
        if (synced && guestItems.length) {
          clearGuestItems();
        }
        if (!cancelled) {
          setHasHydrated(true);
        }
      }
    }

    void initializeCart();

    return () => {
      cancelled = true;
    };
  }, [applyShopifyCart, authLoading, isLoggedIn, requestShopifyCart]);

  useEffect(() => {
    if (!hasHydrated || isLoggedIn) {
      return;
    }
    writeGuestItems(items);
  }, [hasHydrated, isLoggedIn, items]);

  const addItem = useCallback(
    (product, quantity = 1) => {
      const incoming = sanitizeItem({
        ...product,
        quantity: normalizeQuantity(quantity),
      });

      if (!incoming) {
        return false;
      }

      if (!isLoggedIn) {
        setItems((current) => mergeItemIntoList(current, incoming));
        return true;
      }

      setItems((current) => mergeItemIntoList(current, incoming));
      void requestShopifyCart("POST", {
        action: "add",
        variantNumericId: incoming.variantNumericId,
        quantity: incoming.quantity,
      })
        .then((cart) => applyShopifyCart(cart))
        .catch(() => {
          void reloadShopifyCart();
        });
      return true;
    },
    [applyShopifyCart, isLoggedIn, reloadShopifyCart, requestShopifyCart]
  );

  const updateQuantity = useCallback(
    (variantNumericId, quantity) => {
      const normalizedQuantity = normalizeQuantity(quantity, 0, 0);

      if (!isLoggedIn) {
        setItems((current) => {
          if (normalizedQuantity <= 0) {
            return current.filter((item) => item.variantNumericId !== variantNumericId);
          }

          return current.map((item) =>
            item.variantNumericId === variantNumericId
              ? {
                  ...item,
                  quantity: normalizedQuantity,
                }
              : item
          );
        });
        return;
      }

      setItems((current) => {
        if (normalizedQuantity <= 0) {
          return current.filter((item) => item.variantNumericId !== variantNumericId);
        }

        return current.map((item) =>
          item.variantNumericId === variantNumericId
            ? {
                ...item,
                quantity: normalizedQuantity,
              }
            : item
        );
      });

      void requestShopifyCart("PATCH", {
        variantNumericId,
        quantity: normalizedQuantity,
      })
        .then((cart) => applyShopifyCart(cart))
        .catch(() => {
          void reloadShopifyCart();
        });
    },
    [applyShopifyCart, isLoggedIn, reloadShopifyCart, requestShopifyCart]
  );

  const removeItem = useCallback(
    (variantNumericId) => {
      if (!isLoggedIn) {
        setItems((current) => current.filter((item) => item.variantNumericId !== variantNumericId));
        return;
      }

      setItems((current) => current.filter((item) => item.variantNumericId !== variantNumericId));
      void requestShopifyCart("DELETE", { variantNumericId })
        .then((cart) => applyShopifyCart(cart))
        .catch(() => {
          void reloadShopifyCart();
        });
    },
    [applyShopifyCart, isLoggedIn, reloadShopifyCart, requestShopifyCart]
  );

  const clearCart = useCallback(() => {
    if (!isLoggedIn) {
      setItems([]);
      return;
    }

    setItems([]);
    setCheckoutUrl("");
    void requestShopifyCart("DELETE", {})
      .then((cart) => applyShopifyCart(cart))
      .catch(() => {
        void reloadShopifyCart();
      });
  }, [applyShopifyCart, isLoggedIn, reloadShopifyCart, requestShopifyCart]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + normalizeQuantity(item.quantity), 0),
    [items]
  );

  const subtotalAmount = useMemo(
    () => items.reduce((total, item) => total + priceToNumber(item.price) * item.quantity, 0),
    [items]
  );

  const subtotalCurrency = useMemo(
    () => items.find((item) => item.price?.currencyCode)?.price?.currencyCode || "INR",
    [items]
  );

  const guestCartUrl = useMemo(() => {
    if (!items.length) {
      return "";
    }

    const lineItems = items.filter(
      (item) => /^\d+$/.test(item.variantNumericId) && normalizeQuantity(item.quantity) > 0
    );
    if (!lineItems.length) {
      return "";
    }

    const storeDomain =
      lineItems.find((item) => item.storeDomain)?.storeDomain ||
      normalizeStoreDomain(FALLBACK_STORE_DOMAIN);
    if (!storeDomain) {
      return "";
    }

    const encoded = lineItems.map((item) => `${item.variantNumericId}:${item.quantity}`).join(",");
    return `https://${storeDomain}/cart/${encoded}`;
  }, [items]);

  const cartUrl = useMemo(() => {
    if (!isLoggedIn) return guestCartUrl;
    if (!checkoutUrl) return "";
    return checkoutUrl.split("?")[0] || "";
  }, [checkoutUrl, guestCartUrl, isLoggedIn]);

  const effectiveCheckoutUrl = useMemo(() => {
    if (isLoggedIn) return checkoutUrl;
    if (!guestCartUrl) return "";
    return `${guestCartUrl}?checkout`;
  }, [checkoutUrl, guestCartUrl, isLoggedIn]);

  const value = useMemo(
    () => ({
      hasHydrated,
      items,
      itemCount,
      subtotalAmount,
      subtotalCurrency,
      cartUrl,
      checkoutUrl: effectiveCheckoutUrl,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      cartUrl,
      clearCart,
      effectiveCheckoutUrl,
      hasHydrated,
      itemCount,
      items,
      removeItem,
      subtotalAmount,
      subtotalCurrency,
      updateQuantity,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used inside CartProvider.");
  }
  return value;
}

