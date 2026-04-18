import React from "react";
import { Link } from "react-router-dom";
import { 
    Lock, 
    Shield, 
    Clock, 
    Eye, 
    FileText, 
    UploadCloud,
    ArrowRight,
    CheckCircle,
    Zap,
    Users,
    Mail,
    Key,
    Sparkles,
    Fingerprint,
    Server,
    Globe,
    Bell,
    MessageSquare,
    Hash,
    Crown,
    Rocket,
    Database,
    CloudOff,
    BadgeCheck,
    RefreshCw,
    Star,
    TrendingUp,
    ChevronRight
} from "lucide-react";

export default function Home() {
    const features = [
        {
            icon: <Key className="w-5 h-5" />,
            title: "Public Key Cryptography",
            description: "Military-grade RSA-2048 encryption with per-recipient key management. Only intended recipients can decrypt.",
            color: "from-emerald-500 to-teal-600",
            badge: "Enterprise Grade"
        },
        {
            icon: <Users className="w-5 h-5" />,
            title: "Multi-Recipient Support",
            description: "Send encrypted messages to multiple recipients at once. Each recipient uses their own private key to decrypt.",
            color: "from-blue-500 to-indigo-600",
            badge: "Team Collaboration"
        },
        {
            icon: <Server className="w-5 h-5" />,
            title: "Workspace Collaboration",
            description: "Create workspaces, invite team members, and share encrypted messages securely within your organization.",
            color: "from-violet-500 to-purple-600",
            badge: "Enterprise Ready"
        },
        {
            icon: <Bell className="w-5 h-5" />,
            title: "Real-time Notifications",
            description: "Get instant in-app notifications when you receive secure messages. Never miss an important update.",
            color: "from-orange-500 to-amber-600",
            badge: "Instant Alerts"
        },
        {
            icon: <Lock className="w-5 h-5" />,
            title: "End-to-End Encryption",
            description: "Your data is encrypted in your browser before ever touching our servers. Zero-knowledge architecture.",
            color: "from-teal-500 to-emerald-600",
            badge: "Zero Trust"
        },
        {
            icon: <Clock className="w-5 h-5" />,
            title: "Self-Destructing Links",
            description: "Set expiration times and view limits per recipient. Links automatically vanish after serving their purpose.",
            color: "from-rose-500 to-pink-600",
            badge: "Auto-Expiry"
        }
    ];

    const workspaceFeatures = [
        { icon: <Users size={16} />, text: "Invite team members" },
        { icon: <Crown size={16} />, text: "Role-based access" },
        { icon: <Bell size={16} />, text: "Real-time notifications" },
        { icon: <MessageSquare size={16} />, text: "Encrypted messages" },
        { icon: <Mail size={16} />, text: "Email notifications" },
        { icon: <RefreshCw size={16} />, text: "Auto-refresh" }
    ];

    const limits = [
        { icon: <FileText size={18} />, value: "50,000", label: "Characters per text", suffix: "chars" },
        { icon: <UploadCloud size={18} />, value: "20", label: "File size limit", suffix: "MB" },
        { icon: <Eye size={18} />, value: "100", label: "Max views per recipient", suffix: "views" },
        { icon: <Clock size={18} />, value: "7", label: "Max expiry", suffix: "days" }
    ];

    const stats = [
        { value: "AES-256-GCM", label: "Encryption Standard", icon: <Lock size={12} /> },
        { value: "RSA-2048", label: "Key Exchange", icon: <Key size={12} /> },
        { value: "PBKDF2", label: "Key Derivation", icon: <Database size={12} /> },
        { value: "150,000", label: "Iterations", icon: <RefreshCw size={12} /> }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-slate-50 via-white to-teal-50/30 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-100/20 rounded-full blur-3xl"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-32 sm:pb-36">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-teal-200 shadow-sm mb-8">
                            <Sparkles size={14} className="text-teal-600" />
                            <span className="text-xs font-medium text-teal-700">Trusted by security professionals worldwide</span>
                        </div>
                        
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-gray-900 mb-6">
                            Share Secrets,{' '}
                            <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Not Risks
                            </span>
                        </h1>
                        
                        <p className="text-lg sm:text-xl text-gray-500 mb-8 max-w-2xl mx-auto leading-relaxed">
                            End-to-end encrypted text and file sharing with{' '}
                            <span className="font-semibold text-gray-700">multi-recipient support</span>,{' '}
                            <span className="font-semibold text-gray-700">workspace collaboration</span>, and{' '}
                            <span className="font-semibold text-gray-700">real-time notifications</span>.
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/encrypt"
                                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                            >
                                <Lock size={18} />
                                Start Encrypting
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                to="/workspaces"
                                className="group inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-xl font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95 border border-gray-200"
                            >
                                <Users size={18} />
                                Explore Workspaces
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 mt-10">
                            {[
                                { icon: <Shield size={12} />, text: "Open Source" },
                                { icon: <Fingerprint size={12} />, text: "Zero-Knowledge" },
                                { icon: <BadgeCheck size={12} />, text: "Audited" },
                                { icon: <CloudOff size={12} />, text: "No Server Decryption" }
                            ].map((badge, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100">
                                    <span className="text-teal-500">{badge.icon}</span>
                                    <span>{badge.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="border-y border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center">
                                    <span className="text-teal-600">{stat.icon}</span>
                                </div>
                                <div>
                                    <div className="text-sm font-mono font-bold text-gray-900">{stat.value}</div>
                                    <div className="text-xs text-gray-500">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-full mb-4">
                        <Star size={12} className="text-teal-600" />
                        <span className="text-xs font-medium text-teal-700">Premium Features</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Enterprise-Grade Security
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Built with privacy at its core — every feature is designed to protect your sensitive information
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"></div>
                            
                            <div className="relative">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    <div className="text-white">{feature.icon}</div>
                                </div>
                                
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 rounded-full mb-3">
                                    <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">{feature.badge}</span>
                                </div>
                                
                                <h3 className="text-base font-bold text-gray-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Workspace Section */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                                <Crown size={12} className="text-teal-400" />
                                <span className="text-xs font-medium text-teal-300">Team Collaboration</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                                Powerful Workspace Features
                            </h2>
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Collaborate securely with your team using encrypted workspaces. Perfect for organizations that need to share sensitive information internally.
                            </p>
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {workspaceFeatures.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                                        <span className="text-teal-400">{feature.icon}</span>
                                        <span>{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                            <Link
                                to="/workspaces"
                                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                            >
                                <Users size={16} />
                                Start Collaborating
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                                        <MessageSquare size={20} className="text-teal-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Workspace Chat</p>
                                        <p className="text-xs text-gray-400">End-to-end encrypted</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-medium text-white">JD</span>
                                        </div>
                                        <div className="bg-gray-700 rounded-2xl px-4 py-2 max-w-[80%]">
                                            <p className="text-sm text-white">Hey, check the encrypted file I shared</p>
                                            <span className="text-xs text-gray-400 mt-1 block">10:30 AM</span>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 justify-end">
                                        <div className="bg-teal-600 rounded-2xl px-4 py-2 max-w-[80%]">
                                            <p className="text-sm text-white">Got it! Thanks for the secure share</p>
                                            <span className="text-xs text-teal-200 mt-1 block">10:32 AM</span>
                                        </div>
                                        <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-medium text-white">MK</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Limits Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-full mb-4">
                        <TrendingUp size={12} className="text-teal-600" />
                        <span className="text-xs font-medium text-teal-700">Powerful Capabilities</span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Share Anything, With Anyone
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        No matter what you need to share, SecureDrop has you covered with generous limits
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {limits.map((limit, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <span className="text-teal-600">{limit.icon}</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{limit.value}</div>
                            <div className="text-sm text-gray-500 mt-1">{limit.label}</div>
                            <div className="text-xs text-gray-400 mt-1">{limit.suffix}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-full mb-4">
                            <Zap size={12} className="text-teal-600" />
                            <span className="text-xs font-medium text-teal-700">Simple Process</span>
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Three simple steps to share secrets securely
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: 1, icon: <Mail size={24} />, title: "Add Recipients", description: "Enter email addresses of your intended recipients. Each must be a registered user with encryption keys." },
                            { step: 2, icon: <Lock size={24} />, title: "Encrypt Your Message", description: "Write your message or upload a file. Encrypted locally with AES-256 before transmission." },
                            { step: 3, icon: <Globe size={24} />, title: "Share Securely", description: "Get a secure link. Each recipient decrypts with their own private key." }
                        ].map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                    {item.step}
                                </div>
                                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center mb-6">
                                        <span className="text-teal-600">{item.icon}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                                </div>
                                {idx < 2 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ChevronRight size={20} className="text-gray-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notification Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 sm:p-12 border border-amber-100 shadow-sm">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full mb-4">
                                <Bell size={12} className="text-amber-600" />
                                <span className="text-xs font-medium text-amber-700">Stay Updated</span>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Never Miss a Message</h3>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                Get real-time in-app notifications when you receive secure messages. 
                                Email notifications are also sent as a backup.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white/60 rounded-full px-3 py-1.5">
                                    <CheckCircle size={12} className="text-green-500" /> In-app alerts
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white/60 rounded-full px-3 py-1.5">
                                    <Mail size={12} className="text-teal-500" /> Email backup
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white/60 rounded-full px-3 py-1.5">
                                    <Bell size={12} className="text-amber-500" /> Unread badge
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                                        <Bell size={18} className="text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">New Secure Message</p>
                                        <p className="text-xs text-gray-500">Someone sent you a secure message</p>
                                    </div>
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">Just now</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    
                    <div className="relative text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-6">
                            <Rocket size={12} className="text-white" />
                            <span className="text-xs font-medium text-white">Get Started Today</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                            Ready to Share Securely?
                        </h2>
                        <p className="text-teal-100 mb-8 leading-relaxed">
                            Join thousands of users who trust SecureDrop for their sensitive communications
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/encrypt"
                                className="inline-flex items-center justify-center gap-2 bg-white text-teal-700 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                            >
                                <Lock size={16} />
                                Start Encrypting
                            </Link>
                            <Link
                                to="/register"
                                className="inline-flex items-center justify-center gap-2 bg-transparent border border-white/30 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/10 transition-all hover:-translate-y-0.5 active:scale-95"
                            >
                                <Users size={16} />
                                Create Workspace
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}