import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ManagerRoute = () => {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    const isManager = user?.roles?.includes('ROLE_MANAGER');
    const isAdmin = user?.roles?.includes('ROLE_ADMIN');

    // Admins should also be allowed to access Manager routes usually,
    // or just restrict to Manager.
    // For now, let's allow both or just Manager.
    if (!isManager && !isAdmin) return <Navigate to="/" replace />;

    return <Outlet />;
};

export default ManagerRoute;