import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { LogOut, Shield, Bell, ChevronDown } from 'lucide-react';

export default function AdminHeader() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm fixed -top-2 left-0 right-0 z-50 border-b border-gray-200">
            <div className="px-6 py-3 flex items-center justify-between">
                {/* Left side - Logo */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Shield size={24} className="text-red-500" />
                        <span className="text-xl font-bold text-gray-900 hidden md:block">SecureDrop Admin</span>
                    </div>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full ml-2 hidden md:inline-block">
                        Admin Panel
                    </span>
                </div>

                {/* Right side - User menu */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg px-3 py-2 transition"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold text-sm">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-gray-500">{user?.email || 'admin@securedrop.com'}</p>
                            </div>
                            <ChevronDown size={16} className="text-gray-400" />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}