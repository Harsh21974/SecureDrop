import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { useAuth } from "../../src/contexts/AuthContext";

export default function Layout() {
    const { user } = useAuth();
    const location = useLocation();
    
    // Don't show header/footer on admin routes
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    // If it's an admin route, don't use the regular layout
    if (isAdminRoute) {
        return <Outlet />;
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}