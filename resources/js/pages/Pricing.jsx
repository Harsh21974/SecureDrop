import React from "react";
import { Link } from "react-router-dom";
import { Clock, Zap, Shield, Mail, ArrowRight } from "lucide-react";

export default function Pricing() {
    return (
        <div className="bg-gradient-to-br from-slate-50 via-white to-teal-50 py-12">
            {/* Background Glow */}
            <div className="absolute -top-32 -right-32 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] bg-teal-200/30 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-emerald-200/20 blur-3xl rounded-full"></div>

            {/* Main Content */}
            <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Coming Soon Badge */}
                <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full mb-8 shadow-sm">
                    <Clock size={16} />
                    <span className="text-sm font-medium tracking-wide">COMING SOON</span>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-5 rounded-3xl shadow-xl animate-pulse">
                        <Zap size={48} className="text-white" />
                    </div>
                </div>

                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                    Pricing Page
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600 block sm:inline">
                        {" "}Coming Soon
                    </span>
                </h1>

                {/* Description */}
                <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    We're working hard to bring you the best pricing plans for secure file sharing. 
                    Stay tuned for exciting updates and exclusive launch offers!
                </p>

                {/* Feature Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
                    {[
                        { icon: <Shield size={18} />, text: "Secure Sharing" },
                        { icon: <Zap size={18} />, text: "Fast Transfers" },
                        { icon: <Mail size={18} />, text: "Email Notifications" }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm border border-gray-100">
                            <span className="text-teal-600">{item.icon}</span>
                            <span className="text-gray-700 text-sm font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/encrypt"
                        className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-700 to-emerald-700 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                    >
                        Try Free Version
                        <ArrowRight size={18} />
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 border border-gray-200"
                    >
                        Back to Home
                    </Link>
                </div>

                {/* Launch Notification */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Want to be notified when pricing is available? 
                        <button className="ml-2 text-teal-600 font-medium hover:text-teal-700 transition-colors">
                            Get early access →
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}