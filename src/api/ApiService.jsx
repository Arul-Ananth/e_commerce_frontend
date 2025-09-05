// services/apiService.js
import axios from "axios";

const API_BASE = 'http://localhost:8080/product';

const API_BASE_AUTH = 'http://localhost:8080/auth';

export async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE}/categories`);
        const data = await res.json();
        return ['All', ...data];
    } catch (err) {
        console.error('Error fetching categories:', err);
        return [];
    }
}


export async function fetchProducts(category) {
    try {
        const url = category === 'All'
            ? `${API_BASE}/list`
            : `${API_BASE}/category/${category.toLowerCase()}`;

        const res = await fetch(url);
        return await res.json();
    } catch (err) {
        console.error('Error fetching products:', err);
        return [];
    }
}

export async function fetchProduct(id) {
    try{
        const res = await fetch(`${API_BASE}/${id}`);
        return await res.json();
    }
    catch(err){
        console.error('Error fetching product:', err);
        return {};
    }
}

export async function fetchReviews(id) {
    try{
        const res = await fetch(`${API_BASE}/reviews/${id}`);
        return await res.json();
    }
    catch(err){
        console.error('Error fetching reviews:', err);
        return [];
    }
}

// ---- Axios instances ----
const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

const authApi = axios.create({
    baseURL: API_BASE_AUTH,
    withCredentials: true,
});

// ---- Auth ----
async function login({ email, password }) {
    const { data } = await authApi.post("/login", { email, password }); // ✅ correct base
    return data;
}

async function signup({ email, password, phone }) {
    const { data } = await authApi.post("/signup", { email, password, phone });
    return data;
}

// ---- Token helpers ----
function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        authApi.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
}

function clearAuthToken() {
    delete api.defaults.headers.common.Authorization;
    delete authApi.defaults.headers.common.Authorization;
}

// ---- Cart ----
async function getCart() {
    const { data } = await api.get("/cart");
    return data.items ?? [];
}

async function addOrUpdateCartItem(productId, quantity) {
    const { data } = await api.post("/cart/items", { productId, quantity });
    return data;
}

async function updateCartItem(productId, quantity) {
    const { data } = await api.patch(`/cart/items/${productId}`, { quantity });
    return data;
}

async function removeCartItem(productId) {
    const { data } = await api.delete(`/cart/items/${productId}`);
    return data;
}

async function clearCart() {
    const { data } = await api.delete("/cart");
    return data;
}

async function startCheckout() {
    const { data } = await api.post("/checkout", {});
    return data;
}

// ---- Export everything ----
export default {
    api,
    authApi,
    setAuthToken,
    clearAuthToken,
    login,
    signup, // ✅ fixed spelling + exported
    getCart,
    addOrUpdateCartItem,
    updateCartItem,
    removeCartItem,
    clearCart,
    startCheckout,
};