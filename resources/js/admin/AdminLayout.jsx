import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from '../../views/components/AdminHeader';
import AdminSidebar from '../../views/components/AdminSidebar';

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <AdminHeader />
            <AdminSidebar />
            {/* Main content - added more padding-top to clear the fixed header */}
            <main className="ml-64 pt-24">  {/* ← ONLY THIS LINE CHANGED */}
                <div className="p-6 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}