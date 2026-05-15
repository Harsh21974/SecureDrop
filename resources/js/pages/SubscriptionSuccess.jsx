// resources/js/pages/SubscriptionSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useSubscription } from '../../src/contexts/SubscriptionContext';
import api from '../../src/api';

export default function SubscriptionSuccess() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const { fetchSubscriptionStatus } = useSubscription();
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (sessionId) {
            verifySubscription();
        } else {
            setError('No session ID found. Please contact support.');
            setVerifying(false);
        }
    }, [sessionId]);

    const verifySubscription = async () => {
        try {
            // Call the verification endpoint
            const response = await api.post('/subscription/verify', {
                session_id: sessionId
            });
            
            if (response.data.success) {
                setSuccess(true);
                // Refresh subscription status
                await fetchSubscriptionStatus();
                // Redirect after 3 seconds
                setTimeout(() => {
                    navigate('/pricing');
                }, 3000);
            } else {
                setError('Verification failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Verification error:', err);
            setError(err.response?.data?.message || 'Failed to verify subscription. Please contact support.');
        } finally {
            setVerifying(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-teal-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600">Verifying your subscription...</p>
                    <p className="text-sm text-gray-400 mt-2">Please wait while we activate your premium account</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} className="text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/pricing')}
                        className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-semibold transition"
                    >
                        Back to Pricing
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={40} className="text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h1>
                <p className="text-gray-600 mb-4">
                    Thank you for subscribing to SecureDrop Premium!
                </p>
                <p className="text-sm text-gray-500 mb-6">
                    Your premium features are now active. Redirecting you back...
                </p>
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-teal-600 border-t-transparent"></div>
                </div>
            </div>
        </div>
    );
}