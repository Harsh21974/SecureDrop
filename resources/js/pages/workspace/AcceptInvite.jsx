import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../src/api";
import { Users, XCircle, Loader2, ArrowRight } from "lucide-react";

const AcceptInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [inviteData, setInviteData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchInviteDetails();
    }, [token]);

    const fetchInviteDetails = async () => {
        try {
            const response = await api.get(`/invite-details/${token}`);
            setInviteData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid or expired invitation");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = () => {
        // Store token in localStorage for after registration
        localStorage.setItem('pending_invite_token', token);
        // Navigate to register page with pre-filled email
        navigate('/register', { state: { email: inviteData?.invited_email } });
    };

    const handleLogin = () => {
        localStorage.setItem('pending_invite_token', token);
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-teal-600" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <XCircle className="mx-auto text-red-500 mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitation Invalid</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={() => navigate("/")} className="bg-gray-600 text-white px-6 py-2 rounded-lg">
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-teal-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-teal-600 px-6 py-8 text-center">
                    <div className="bg-white/20 inline-flex p-3 rounded-full mb-4">
                        <Users className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-1">Workspace Invitation</h1>
                    <p className="text-teal-100">You've been invited to collaborate</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center">
                        <p className="text-sm text-gray-600 mb-1">You're invited to join</p>
                        <p className="text-xl font-bold text-gray-900">{inviteData?.workspace_name}</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Invited by {inviteData?.invited_by}
                        </p>
                        {inviteData?.expires_at && (
                            <p className="text-xs text-gray-500 mt-1">
                                Expires {new Date(inviteData.expires_at).toLocaleDateString()}
                            </p>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-6">
                        <p className="text-sm text-blue-800 text-center">
                            Create an account or login to accept this invitation from your dashboard.
                        </p>
                    </div>

                    <button
                        onClick={handleRegister}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                        Create Account
                        <ArrowRight size={18} />
                    </button>

                    <button
                        onClick={handleLogin}
                        className="w-full mt-3 border-2 border-gray-300 hover:border-teal-400 text-gray-700 hover:text-teal-700 font-semibold py-3 rounded-xl transition"
                    >
                        Login to Existing Account
                    </button>

                    <button
                        onClick={() => navigate("/")}
                        className="w-full mt-3 text-gray-500 hover:text-gray-700 text-sm py-2"
                    >
                        No thanks, take me home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AcceptInvite;