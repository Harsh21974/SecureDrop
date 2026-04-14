import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "../../src/contexts/AuthContext";
import { generateKeyPair, encryptPrivateKeyWithPassword } from "../crypto/keys";
import { Lock, Mail, User, Eye, EyeOff, Key, Shield, AlertCircle } from 'lucide-react';

export default function Register() {
    const location = useLocation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState(location.state?.email || '');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatingKeys, setGeneratingKeys] = useState(false);
    const [keysGenerated, setKeysGenerated] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    useEffect(() => {
        const pendingToken = localStorage.getItem('pending_invite_token');
        if (!pendingToken && !location.state?.email) {
            setEmail('');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (password !== passwordConfirmation) {
            return setError('Passwords do not match');
        }
        
        if (password.length < 8) {
            return setError('Password must be at least 8 characters');
        }
        
        setLoading(true);
        setGeneratingKeys(true);
        
        try {
            // Generate RSA key pair
            const keyPair = await generateKeyPair();
            
            // Encrypt private key with user's password
            const encryptedPrivateKey = await encryptPrivateKeyWithPassword(keyPair.privateKey, password);
            
            // Register with keys
            await register(name, email, password, passwordConfirmation, keyPair.publicKey, encryptedPrivateKey);
            
            setKeysGenerated(true);
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to register');
            setGeneratingKeys(false);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="bg-white shadow-2xl rounded-3xl p-8">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-teal-100 p-3 rounded-full">
                                <User className="text-teal-600" size={24} />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-sm text-gray-500 mt-2">Join SecureDrop today</p>
                    </div>

                    {generatingKeys && !keysGenerated && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin">
                                    <Key size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-800">Generating encryption keys...</p>
                                    <p className="text-xs text-blue-600">This ensures your messages are end-to-end encrypted.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {keysGenerated && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-green-800">Keys generated successfully!</p>
                                    <p className="text-xs text-green-600">Your account is ready for secure messaging.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name, Email, Password fields - same as before */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-200 focus:border-teal-500 rounded-xl py-3 pl-10 pr-4" placeholder="John Doe" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 focus:border-teal-500 rounded-xl py-3 pl-10 pr-4" placeholder="you@example.com" readOnly={!!location.state?.email} />
                            </div>
                            {location.state?.email && <p className="text-xs text-teal-600 mt-1">This email was used for your workspace invitation</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-200 focus:border-teal-500 rounded-xl py-3 pl-10 pr-10" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type={showConfirmPassword ? "text" : "password"} required value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} className="w-full border border-gray-200 focus:border-teal-500 rounded-xl py-3 pl-10 pr-10" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                            <div className="flex items-start gap-2">
                                <AlertCircle size={14} className="text-amber-600 mt-0.5" />
                                <p className="text-xs text-amber-700">
                                    Your encryption keys are generated in your browser and protected by your password. 
                                    If you forget your password, your encrypted data cannot be recovered.
                                </p>
                            </div>
                        </div>

                        {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-xl">{error}</div>}

                        <button type="submit" disabled={loading || generatingKeys} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50">
                            {loading ? 'Creating account...' : generatingKeys ? 'Generating keys...' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account? <Link to="/login" className="text-teal-600 hover:underline font-medium">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}