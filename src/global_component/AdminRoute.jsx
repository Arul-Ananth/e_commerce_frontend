import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Ensure this path matches your project structure

const AdminRoute = () => {
    const { isAuthenticated, user } = useAuth();

    // 1. Check if user is logged in
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 2. Check if user has ADMIN role
    // The user object comes from your AuthContext (decoded from JWT or state)
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    if (!isAdmin) {
        // Redirect non-admins to home
        return <Navigate to="/" replace />;
    }

    // 3. Render the protected component
    return <Outlet />;
};

export default AdminRoute;