import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import ApiService from "../api/ApiService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Fixed: Added try/catch to prevent 403 errors from crashing the app
    const loadCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCartItems([]);
            return;
        }
        setLoading(true);
        try {
            const items = await ApiService.getCart();
            setCartItems(items);
        } catch (err) {
            console.error("Failed to load cart:", err);
            // Optional: If error is 403, the AuthContext will likely handle logout or token refresh eventually.
            // We catch it here to keep the UI stable.
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const addToCart = useCallback(async (product, qty = 1) => {
        // Optimistic UI Update
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
            // 2. Fixed: Send only 'qty' (delta), not the total.
            // Your backend 'addOrIncrement' adds this value to the existing stock.
            await ApiService.addOrUpdateCartItem(product.id, qty);
        } catch (e) {
            console.error("Add to cart failed, rolling back", e);
            await loadCart(); // Rollback to server state
            throw e;
        }
    }, [loadCart]);

    const updateQuantity = useCallback(async (productId, quantity) => {
        // Optimistic Update
        setCartItems((prev) => prev.map((p) => (p.id === productId ? { ...p, quantity } : p)));
        try {
            // This endpoint sets the ABSOLUTE quantity (PATCH), so passing 'quantity' is correct.
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