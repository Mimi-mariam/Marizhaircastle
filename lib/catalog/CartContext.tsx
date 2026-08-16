"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface GuestCartItem {
  variantId: string;
  quantity: number;
}

interface CartContextValue {
  itemCount: number;
  isGuest: boolean;
  refreshCartCount: () => Promise<void>;
  addGuestItem: (variantId: string, quantity: number) => void;
  updateGuestItemQuantity: (variantId: string, quantity: number) => void;
  removeGuestItem: (variantId: string) => void;
  clearGuestCart: () => void;
  guestItems: GuestCartItem[];
  buyNowItem: GuestCartItem | null;
  setBuyNowItem: (item: GuestCartItem | null) => void;
  clearBuyNow: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const GUEST_CART_KEY = "mhc_guest_cart";

function readLocalCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item) =>
          typeof item?.variantId === "string" &&
          typeof item?.quantity === "number" &&
          item.quantity > 0
      );
    }
  } catch {
    // ignore parse error
  }
  return [];
}

function writeLocalCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    if (items.length === 0) {
      localStorage.removeItem(GUEST_CART_KEY);
    } else {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
  } catch {
    // ignore write error
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [guestItems, setGuestItems] = useState<GuestCartItem[]>([]);
  const [serverCount, setServerCount] = useState<number | null>(null);
  const [hasMerged, setHasMerged] = useState(false);
  const [buyNowItem, setBuyNowItem] = useState<GuestCartItem | null>(null);

  // Load initial guest cart from local storage on mount
  useEffect(() => {
    setGuestItems(readLocalCart());
  }, []);

  // Fetch server count when authenticated
  const fetchServerCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data?.itemCount != null) {
          setServerCount(data.itemCount);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Safe merge guest cart with user cart on login
  useEffect(() => {
    if (!isAuthenticated || hasMerged) return;

    const currentGuestItems = readLocalCart();
    if (currentGuestItems.length > 0) {
      // Merge guest cart with server cart
      fetch("/api/cart/merge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: currentGuestItems }),
      })
        .then((res) => {
          if (res.ok) {
            writeLocalCart([]);
            setGuestItems([]);
            setHasMerged(true);
            fetchServerCount();
          }
        })
        .catch(() => {});
    } else {
      setHasMerged(true);
      fetchServerCount();
    }
  }, [isAuthenticated, hasMerged, fetchServerCount]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchServerCount();
    } else {
      setServerCount(null);
      setHasMerged(false);
    }
  }, [isAuthenticated, fetchServerCount]);

  const addGuestItem = useCallback((variantId: string, quantity: number) => {
    setGuestItems((prev) => {
      const existing = prev.find((item) => item.variantId === variantId);
      let updated: GuestCartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { variantId, quantity }];
      }
      writeLocalCart(updated);
      return updated;
    });
  }, []);

  const updateGuestItemQuantity = useCallback((variantId: string, quantity: number) => {
    setGuestItems((prev) => {
      let updated: GuestCartItem[];
      if (quantity <= 0) {
        updated = prev.filter((item) => item.variantId !== variantId);
      } else {
        updated = prev.map((item) =>
          item.variantId === variantId ? { ...item, quantity } : item
        );
      }
      writeLocalCart(updated);
      return updated;
    });
  }, []);

  const removeGuestItem = useCallback((variantId: string) => {
    setGuestItems((prev) => {
      const updated = prev.filter((item) => item.variantId !== variantId);
      writeLocalCart(updated);
      return updated;
    });
  }, []);

  const clearGuestCart = useCallback(() => {
    writeLocalCart([]);
    setGuestItems([]);
  }, []);

  const clearBuyNow = useCallback(() => {
    setBuyNowItem(null);
  }, []);

  const refreshCartCount = useCallback(async () => {
    if (isAuthenticated) {
      await fetchServerCount();
    } else {
      setGuestItems(readLocalCart());
    }
  }, [isAuthenticated, fetchServerCount]);

  const guestCount = guestItems.reduce((sum, item) => sum + item.quantity, 0);
  const itemCount = isAuthenticated ? (serverCount ?? 0) : guestCount;

  return (
    <CartContext.Provider
      value={{
        itemCount,
        isGuest: !isAuthenticated,
        refreshCartCount,
        addGuestItem,
        updateGuestItemQuantity,
        removeGuestItem,
        clearGuestCart,
        guestItems,
        buyNowItem,
        setBuyNowItem,
        clearBuyNow,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
