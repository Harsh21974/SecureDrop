// resources/js/pages/Pricing.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../src/contexts/AuthContext';
import { useSubscription } from '../../src/contexts/SubscriptionContext';
import { CheckCircle, Star, Shield, ArrowRight, Crown } from 'lucide-react';

export default function Pricing() {
    const { user } = useAuth();
    const { 
        plans, 
        subscribe, 
        loading,
        isPremium,
        hasActiveSubscription,
        subscriptionStatus
    } = useSubscription();
    
    const [processingPlan, setProcessingPlan] = useState(null);

    const features = [
        { free: true, premium: true, text: 'End-to-end encryption' },
        { free: true, premium: true, text: 'Self-destructing links' },
        { free: true, premium: true, text: 'Multi-recipient support' },
        { free: '5/month', premium: 'Unlimited', text: 'Secure messages' },
        { free: '20MB', premium: '50MB', text: 'File size limit' },
        { free: '3 members', premium: 'Unlimited', text: 'Workspace members' },
        { free: '1 recipient', premium: 'Unlimited', text: 'Recipients per message' },
        { free: '24 Hours', premium: '24 Hours', text: 'Maximum expiry' }
    ];

    const handleSubscribe = async () => {
        if (!user) {
            localStorage.setItem('redirectAfterLogin', '/pricing');
            window.location.href = '/login';
            return;
        }
        
        setProcessingPlan(true);
        try {
            const successUrl = `${window.location.origin}/subscription/success`;
            const cancelUrl = `${window.location.origin}/pricing`;
            await subscribe('yearly', successUrl, cancelUrl);
        } catch (err) {
            alert('Failed to start subscription: ' + err.message);
        } finally {
            setProcessingPlan(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-teal-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading pricing plans...</p>
                </div>
            </div>
        );
    }

    const yearlyPlan = plans.find(p => p.interval === 'year');
    const planPrice = yearlyPlan?.price || 9.99;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 py-12 px-4">
            {/* Current subscription status banner */}
            {isPremium && (
                <div className="max-w-4xl mx-auto mb-8">
                    <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <Crown size={24} className="text-teal-600" />
                            <div>
                                <p className="font-semibold text-gray-900">Premium Active</p>
                                <p className="text-sm text-gray-600">
                                    {hasActiveSubscription && subscriptionStatus?.subscription_ends_at ? (
                                        <>Valid until {new Date(subscriptionStatus.subscription_ends_at).toLocaleDateString()}</>
                                    ) : (
                                        <>You have lifetime premium access</>
                                    )}
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/subscription"
                            className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center gap-1"
                        >
                            Manage Subscription <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-12">
                <div className="inline-flex items-center gap-2 bg-teal-100 px-4 py-2 rounded-full mb-4">
                    <Star size={16} className="text-teal-600" />
                    <span className="text-sm font-medium text-teal-700">Simple, Transparent Pricing</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                    Choose Your Plan
                </h1>
                <p className="text-lg text-gray-600">
                    Start with our free plan and upgrade to premium for unlimited secure messaging
                </p>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-16">
                {/* Free Plan */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all">
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-gray-900">$0</span>
                            <span className="text-gray-500">/forever</span>
                        </div>
                        <p className="text-gray-600 mb-6">Perfect for personal use and trying out SecureDrop</p>
                        
                        <ul className="space-y-3 mb-8">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm">
                                    {feature.free === true ? (
                                        <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
                                    ) : (
                                        <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
                                    )}
                                    <span className="text-gray-700">
                                        {feature.text}
                                        {typeof feature.free === 'string' && (
                                            <span className="text-gray-500 ml-1">({feature.free})</span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        
                        {!isPremium && (
                            <Link
                                to={user ? "/encrypt" : "/register"}
                                className="block w-full text-center py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:border-teal-400 hover:text-teal-600 transition"
                            >
                                {user ? 'Get Started Free' : 'Sign Up Free'}
                            </Link>
                        )}
                        {isPremium && (
                            <div className="w-full text-center py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold">
                                Current Plan
                            </div>
                        )}
                    </div>
                </div>

                {/* Premium Plan - Yearly Only */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-teal-400 relative hover:shadow-2xl transition-all">
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                        POPULAR
                    </div>
                    
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                            Premium <Crown size={20} className="text-teal-600" />
                        </h3>
                        
                        <div className="mb-6">
                            <div>
                                <span className="text-4xl font-bold text-gray-900">${planPrice}</span>
                                <span className="text-gray-500">/year</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Billed annually</p>
                        </div>
                        
                        <p className="text-gray-600 mb-6">Unlock all features for your team</p>
                        
                        <ul className="space-y-3 mb-8">
                            {features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm">
                                    <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
                                    <span className="text-gray-700">
                                        {feature.text}
                                        {typeof feature.premium === 'string' && (
                                            <span className="text-gray-500 ml-1">(up to {feature.premium})</span>
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        
                        {!isPremium ? (
                            <button
                                onClick={handleSubscribe}
                                disabled={processingPlan}
                                className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold transition disabled:opacity-50"
                            >
                                {processingPlan ? 'Processing...' : 'Subscribe →'}
                            </button>
                        ) : (
                            <div className="w-full text-center py-3 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold">
                                ✓ Premium Active
                            </div>
                        )}
                    </div>
                </div>
            </div>

            
            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto mt-16">
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    {[
                        { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time. You'll continue to have premium access until the end of your billing period." },
                        { q: "Is my data secure?", a: "Absolutely. All data is encrypted end-to-end using AES-256 and RSA-2048 encryption. We never have access to your decrypted content." },
                        { q: "What payment methods do you accept?", a: "We accept all major credit cards including Visa, Mastercard, American Express, and Discover." },
                        { q: "Do you offer refunds?", a: "We offer a 14-day money-back guarantee for annual subscriptions." },
                    ].map((faq, idx) => (
                        <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                            <p className="text-gray-600 text-sm">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}