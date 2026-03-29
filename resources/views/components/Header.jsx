import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { User, LogOut, LayoutDashboard, Shield } from "lucide-react";

export default function Header() {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    // Check if user is admin
    const isAdmin = user?.role === 'admin';

    return (
        <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md fixed top-0 left-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <Link to={isAdmin ? "/admin" : "/"} className="flex items-center gap-2 group">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full group-hover:scale-110 transition-transform"></div>
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                        SecureDrop{isAdmin && " Admin"}
                    </span>
                </Link>

                {/* Nav - Show different nav items for admin vs user */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-gray-600">
                    {!isAdmin ? (
                        // Regular user navigation
                        <>
                            <Link to="/" className="hover:text-emerald-600 transition relative py-1">
                                Home
                            </Link>
                            <Link to="/encrypt" className="hover:text-emerald-600 transition relative py-1">
                                Encrypt Text
                            </Link>
                            <Link to="/pricing" className="hover:text-emerald-600 transition relative py-1">
                                Pricing
                            </Link>
                        </>
                    ) : (
                        // Admin navigation
                        <>
                            <Link to="/admin" className="hover:text-emerald-600 transition relative py-1">
                                Dashboard
                            </Link>
                            <Link to="/admin/users" className="hover:text-emerald-600 transition relative py-1">
                                Users
                            </Link>
                            <Link to="/admin/secure-items" className="hover:text-emerald-600 transition relative py-1">
                                Secure Items
                            </Link>
                        </>
                    )}
                </nav>

                {/* Auth Buttons / User Menu */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {user ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition"
                            >
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                                    isAdmin ? 'bg-red-100 text-red-700' : 'bg-teal-100 text-teal-700'
                                }`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                    {user.name.split(' ')[0]}
                                    {isAdmin && <span className="ml-1 text-xs text-red-600">(Admin)</span>}
                                </span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                                    <Link
                                        to={isAdmin ? "/admin" : "/profile"}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        onClick={() => setDropdownOpen(false)}
                                    >
                                        <User size={16} /> {isAdmin ? "Admin Dashboard" : "Profile"}
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin/users"
                                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            <Shield size={16} /> Manage Users
                                        </Link>
                                    )}
                                    <button
                                        onClick={() => {
                                            logout();
                                            setDropdownOpen(false);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition px-2 py-1.5"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition shadow-sm hover:shadow-md active:scale-95"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}