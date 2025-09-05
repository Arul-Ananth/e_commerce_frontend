import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Header from "./components/Header";
import MainPage from "./pages/MainPage";

import SignUp from "./pages/Sing-up.jsx";
import ProductDetails from "./pages/ProductDetails";
import Buy from "./pages/Buy.jsx";
import Login from "./pages/Login.jsx";
import { AuthProvider, useAuth } from "./global_component/AuthContext";
import { CartProvider } from "./global_component/CartContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Header />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <Buy />
                </ProtectedRoute>
              }
            />
            {/* Add your cart route if you have one
            <Route path="/cart" element={<CartPage />} /> */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}