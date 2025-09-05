import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ApiService from "../api/ApiService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const items = await ApiService.getCart();
      setCartItems(items);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Load cart when auth state changes
    loadCart();
  }, [loadCart]);

  const addToCart = useCallback(async (product, qty = 1) => {
    // product: { id, title, price, imageUrl }
    setCartItems((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx === -1) {
        return [...prev, { ...product, quantity: qty }];
      } else {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + qty };
        return updated;
      }
    });

    try {
      // Upsert server-side
      const existing = cartItems.find((p) => p.id === product.id);
      const newQty = (existing?.quantity || 0) + qty;
      await ApiService.addOrUpdateCartItem(product.id, newQty);
    } catch (e) {
      // rollback: reload from server
      await loadCart();
      throw e;
    }
  }, [cartItems, loadCart]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    setCartItems((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity } : p)));
    try {
      await ApiService.updateCartItem(productId, quantity);
    } catch (e) {
      await loadCart();
      throw e;
    }
  }, [loadCart]);

  const removeFromCart = useCallback(async (productId) => {
    const prevSnapshot = cartItems;
    setCartItems((prev) => prev.filter((p) => p.id !== productId));
    try {
      await ApiService.removeCartItem(productId);
    } catch (e) {
      setCartItems(prevSnapshot);
      throw e;
    }
  }, [cartItems]);

  const clear = useCallback(async () => {
    const prevSnapshot = cartItems;
    setCartItems([]);
    try {
      await ApiService.clearCart();
    } catch (e) {
      setCartItems(prevSnapshot);
      throw e;
    }
  }, [cartItems]);

  const cartCount = useMemo(() => cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0), [cartItems]);

  const value = useMemo(() => ({
    cartItems,
    cartCount,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clear,
    reload: loadCart,
  }), [cartItems, cartCount, loading, addToCart, updateQuantity, removeFromCart, clear, loadCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}