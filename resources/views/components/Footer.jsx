import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="relative">
            {/* Soft top divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>

            <div className="bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Brand Section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <span className="text-lg font-semibold text-gray-900">
                                    SecureDrop
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                                End-to-end encrypted file and text sharing with
                                expiring links and zero plaintext storage.
                                Built for privacy-first communication.
                            </p>
                        </div>

                        {/* Product Links */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide uppercase">
                                Product
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li>
                                    <Link to="/encrypt" className="hover:text-emerald-600 transition">
                                        Encrypt Text
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pricing" className="hover:text-emerald-600 transition">
                                        Pricing
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/security" className="hover:text-emerald-600 transition">
                                        Security
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Legal / Info */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 tracking-wide uppercase">
                                Company
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600">
                                <li>
                                    <Link to="/about" className="hover:text-emerald-600 transition">
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/privacy" className="hover:text-emerald-600 transition">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="hover:text-emerald-600 transition">
                                        Terms
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                        <span>
                            © {new Date().getFullYear()} SecureDrop. All rights reserved.
                        </span>
                        <span className="mt-4 md:mt-0">
                            Built with privacy in mind.
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}