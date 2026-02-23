import { Link } from "react-router-dom";
import React from "react";

export default function Header() {
        return (
                <header className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md fixed top-0 left-0 z-50">
                        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

                                {/* Logo */}
                                <Link to="/" className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                        <span className="text-lg font-semibold text-gray-900">
                                                SecureDrop
                                        </span>
                                </Link>

                                {/* Nav */}
                                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
                                        <Link to="/" className="hover:text-emerald-600 transition">
                                                Home
                                        </Link>
                                        <Link to="/encrypt" className="hover:text-emerald-600 transition">
                                                Encrypt Text
                                        </Link>
                                        <Link to="/pricing" className="hover:text-emerald-600 transition">
                                                Pricing
                                        </Link>
                                </nav>

                                {/* Auth Buttons */}
                                <div className="flex items-center gap-3">
                                        <Link
                                                to="/login"
                                                className="text-sm text-gray-600 hover:text-gray-900 transition"
                                        >
                                                Sign In
                                        </Link>

                                        <Link
                                                to="/register"
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-xl transition"
                                        >
                                                Register
                                        </Link>
                                </div>
                        </div>
                </header>
        );
}