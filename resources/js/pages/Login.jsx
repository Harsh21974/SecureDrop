import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "../../src/contexts/AuthContext";
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await login(email, password);
            
            // Get user from response or from context after login
            const loggedInUser = response?.user || user;
            
            // Role-based redirect
            if (loggedInUser && loggedInUser.role === 'admin') {
                navigate('/admin', { replace: true });
            } else {
                navigate('/profile', { replace: true });
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-2xl rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-teal-100 p-3 rounded-full">
                                <Lock className="text-teal-600" size={24} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-sm text-gray-500 mt-2">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl py-3 pl-10 pr-4 transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl py-3 pl-10 pr-4 transition"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"  
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-teal-400/30 disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-teal-600 hover:underline font-medium">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}