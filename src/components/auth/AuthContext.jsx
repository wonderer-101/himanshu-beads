"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const AuthContext = createContext({
  customer: null,      // { id, firstName, lastName, emailAddress: { emailAddress } } | null
  loading: true,
  refetch: () => {},
});

export function AuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/shopify/me");
      if (res.ok) {
        const data = await res.json();
        setCustomer(data.customer ?? null);
      } else {
        setCustomer(null);
      }
    } catch {
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <AuthContext.Provider value={{ customer, loading, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}