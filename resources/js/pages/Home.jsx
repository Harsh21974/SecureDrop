import React from "react";
import { Link } from "react-router-dom";
import { 
    Lock, 
    Shield, 
    Clock, 
    Eye, 
    FileText, 
    UploadCloud,
    Github,
    ArrowRight,
    CheckCircle,
    Zap,
    Globe,
    ServerOff
} from "lucide-react";

export default function Home() {
    const features = [
        {
            icon: <Lock className="w-6 h-6 text-teal-600" />,
            title: "End-to-End Encryption",
            description: "Your data is encrypted in your browser before ever touching our servers. We never see your keys or content."
        },
        {
            icon: <ServerOff className="w-6 h-6 text-teal-600" />,
            title: "Zero-Knowledge Architecture",
            description: "With client-side encryption, not even we can access your encrypted data. Your privacy is absolute."
        },
        {
            icon: <Clock className="w-6 h-6 text-teal-600" />,
            title: "Self-Destructing Links",
            description: "Set expiration times and view limits. Links automatically vanish after serving their purpose."
        },
        {
            icon: <Shield className="w-6 h-6 text-teal-600" />,
            title: "Military-Grade Security",
            description: "AES-256-GCM encryption — the same standard used by governments and security professionals worldwide."
        }
    ];

    const howItWorks = [
        {
            step: 1,
            title: "Create Your Secret",
            description: "Paste text or upload a file you want to protect. Choose between single-use or limited views.",
            icon: <FileText className="w-8 h-8 text-teal-600" />
        },
        {
            step: 2,
            title: "Set Your Password",
            description: "Choose a strong password. Remember, if you lose it, your data is unrecoverable.",
            icon: <Lock className="w-8 h-8 text-teal-600" />
        },
        {
            step: 3,
            title: "Share Securely",
            description: "Get a secure link to share. You can even restrict access to specific email addresses.",
            icon: <Globe className="w-8 h-8 text-teal-600" />
        }
    ];

    const stats = [
        { value: "AES-256", label: "Encryption" },
        { value: "20MB", label: "Max File Size" },
        { value: "24h", label: "Max Expiry" },
        { value: "100", label: "Max Views" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Glow - matching your encrypt/decrypt pages */}
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] sm:w-[800px] sm:h-[800px] bg-teal-200/30 blur-3xl rounded-full"></div>
                <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-emerald-200/20 blur-3xl rounded-full"></div>
                
                {/* Hero Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="flex items-center justify-center gap-2 text-teal-700 mb-4">
                            <Shield size={20} />
                            <span className="uppercase text-xs tracking-widest font-medium">
                                Secure • Private • Open Source
                            </span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                            Share Secrets,{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-600">
                                Not Risks
                            </span>
                        </h1>
                        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                            End-to-end encrypted text and file sharing that puts you in control. 
                            Your data, your keys, your privacy — no compromises.
                        </p>
                        
                        {/* CTA Buttons - matching your button styles */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link
                                to="/encrypt"
                                className="group bg-teal-700 hover:bg-teal-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-200 ease-in-out shadow-lg hover:shadow-teal-400/30 hover:-translate-y-0.5 active:scale-95 flex items-center gap-2"
                            >
                                <Lock size={18} />
                                Encrypt Now
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {/* <Link
                                to="/decrypt"
                                className="bg-white hover:bg-gray-50 text-gray-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-200 ease-in-out shadow-lg hover:shadow-gray-400/20 hover:-translate-y-0.5 active:scale-95 border border-gray-200"
                            >
                                Decrypt Content
                            </Link> */}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 max-w-3xl mx-auto">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</div>
                                    <div className="text-xs sm:text-sm text-gray-500 mt-1">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Why Choose SecureDrop?
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Built with privacy at its core — every feature is designed to protect your sensitive information.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-teal-200"
                        >
                            <div className="bg-teal-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How It Works Section */}
            <div className="bg-white/50 backdrop-blur-sm py-20 sm:py-28">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Three simple steps to share secrets securely
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
                        {howItWorks.map((item) => (
                            <div key={item.step} className="relative">
                                {/* Step Number */}
                                <div className="absolute -top-3 -left-3 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-bold text-sm">
                                    {item.step}
                                </div>
                                
                                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 ease-in-out hover:-translate-y-1">
                                    <div className="bg-teal-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                                        {item.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                                
                                {/* Connector Line (only between steps) */}
                                {item.step < 3 && (
                                    <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                                        <ArrowRight className="w-6 h-6 text-teal-300" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Use Cases Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                        Perfect For
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        From personal secrets to business documents — SecureDrop handles it all
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: <Lock size={20} />, text: "Password Sharing" },
                        { icon: <FileText size={20} />, text: "Confidential Documents" },
                        { icon: <Eye size={20} />, text: "Private Messages" },
                        { icon: <UploadCloud size={20} />, text: "Secure File Transfer" }
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-200 hover:border-teal-400 transition-all duration-200 ease-in-out hover:-translate-y-0.5 shadow-sm"
                        >
                            <div className="bg-teal-50 p-2 rounded-lg text-teal-600">
                                {item.icon}
                            </div>
                            <span className="font-medium text-gray-700">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-28">
                <div className="bg-gradient-to-r from-teal-700 to-emerald-700 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
                    
                    <div className="relative z-10 text-center max-w-3xl mx-auto">
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                            Ready to Share Securely?
                        </h2>
                        <p className="text-teal-100 mb-8 text-lg">
                            Start encrypting your sensitive data in seconds. No registration required.
                        </p>
                        <Link
                            to="/encrypt"
                            className="inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-200 ease-in-out shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                        >
                            <Zap size={18} />
                            Get Started Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}