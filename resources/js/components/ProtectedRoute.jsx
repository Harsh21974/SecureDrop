import { Navigate } from 'react-router-dom';
import { useAuth } from "../../src/contexts/AuthContext"; 
import React from "react";

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    
    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }
    
    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Render children if authenticated
    return children;
}