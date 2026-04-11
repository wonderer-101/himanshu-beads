"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "hb_cart_v1";
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

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setItems([]);
      } else {
        const parsed = JSON.parse(raw);
        const nextItems = Array.isArray(parsed)
          ? parsed.map((item) => sanitizeItem(item)).filter(Boolean)
          : [];
        setItems(nextItems);
      }
    } catch {
      setItems([]);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage issues to keep UI responsive.
    }
  }, [items, hasHydrated]);

  const addItem = useCallback((product, quantity = 1) => {
    const incoming = sanitizeItem({
      ...product,
      quantity: normalizeQuantity(quantity),
    });

    if (!incoming) {
      return false;
    }

    setItems((current) => {
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
    });

    return true;
  }, []);

  const updateQuantity = useCallback((variantNumericId, quantity) => {
    const normalizedQuantity = normalizeQuantity(quantity, 0, 0);

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
  }, []);

  const removeItem = useCallback((variantNumericId) => {
    setItems((current) => current.filter((item) => item.variantNumericId !== variantNumericId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

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

  const cartUrl = useMemo(() => {
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
      lineItems.find((item) => item.storeDomain)?.storeDomain || normalizeStoreDomain(FALLBACK_STORE_DOMAIN);
    if (!storeDomain) {
      return "";
    }

    const encoded = lineItems.map((item) => `${item.variantNumericId}:${item.quantity}`).join(",");
    return `https://${storeDomain}/cart/${encoded}`;
  }, [items]);

  const checkoutUrl = useMemo(() => {
    if (!cartUrl) {
      return "";
    }
    return `${cartUrl}?checkout`;
  }, [cartUrl]);

  const value = useMemo(
    () => ({
      hasHydrated,
      items,
      itemCount,
      subtotalAmount,
      subtotalCurrency,
      cartUrl,
      checkoutUrl,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      addItem,
      cartUrl,
      checkoutUrl,
      clearCart,
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
