"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalItems: number;
  subtotalPaise: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, size: string, isCustom: boolean, delta: number) => void;
  removeItem: (productId: string, size: string, isCustom: boolean) => void;
  clearCart: () => void;
}

const STORAGE_KEY = "ss_tailors_bag_v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, hydrated]);

  const addItem = (incoming: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (x) =>
          x.productId === incoming.productId &&
          x.size === incoming.size &&
          x.isCustomTailored === incoming.isCustomTailored
      );
      if (idx === -1) {
        return [...prev, { ...incoming, quantity: Math.min(incoming.quantity, Math.max(1, incoming.maxStock)) }];
      }
      const next = [...prev];
      const existing = next[idx];
      next[idx] = {
        ...existing,
        quantity: Math.min(20, Math.min(existing.maxStock, existing.quantity + incoming.quantity)),
      };
      return next;
    });
    setIsOpen(true);
  };

  const updateQuantity = (productId: string, size: string, isCustom: boolean, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (
            item.productId === productId &&
            item.size === size &&
            item.isCustomTailored === isCustom
          ) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return {
              ...item,
              quantity: Math.min(20, Math.min(item.maxStock, nextQty)),
            };
          }
          return item;
        })
        .filter((x): x is CartItem => x !== null)
    );
  };

  const removeItem = (productId: string, size: string, isCustom: boolean) => {
    setItems((prev) =>
      prev.filter(
        (x) =>
          !(
            x.productId === productId &&
            x.size === size &&
            x.isCustomTailored === isCustom
          )
      )
    );
  };

  const clearCart = () => setItems([]);

  const value = useMemo<CartContextValue>(() => {
    const totalItems = items.reduce((sum, x) => sum + x.quantity, 0);
    const subtotalPaise = items.reduce((sum, x) => sum + x.pricePaise * x.quantity, 0);
    return {
      items,
      isOpen,
      totalItems,
      subtotalPaise,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, isOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
