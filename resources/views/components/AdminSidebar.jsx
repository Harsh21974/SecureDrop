import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, Shield, Activity } from 'lucide-react';

export default function AdminSidebar() {
    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true }, // Add end: true for exact match
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/secure-items', label: 'Secure Items', icon: FileText },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <aside className="w-64 bg-white shadow-lg min-h-screen fixed left-0 top-0 z-40 border-r border-gray-200">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Shield className="h-8 w-8 text-red-500" />
                    <span className="font-bold text-lg text-gray-900">SecureDrop</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full ml-1">Admin</span>
                </div>
            </div>
            
            {/* Navigation */}
            <nav className="mt-6 px-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.end || false} // This ensures exact matching for the dashboard
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all duration-200 ${
                                isActive 
                                    ? 'bg-red-50 text-red-600 border-r-2 border-red-500' 
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`
                        }
                    >
                        <item.icon size={20} />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* System Info */}
            <div className="absolute bottom-6 left-0 right-0 px-6">
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Activity size={12} />
                        <span>System Online</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                        SecureDrop v1.0
                    </p>
                </div>
            </div>
        </aside>
    );
}