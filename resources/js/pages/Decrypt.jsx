import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { decryptAESKeyForRecipient, decryptWithAES, decryptPrivateKeyWithPassword } from "../crypto/keys";
import { Copy, Shield, Key, Download, FileText } from "lucide-react";
import api from "../../src/api";
import { useAuth } from "../../src/contexts/AuthContext";

export default function Decrypt() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [content, setContent] = useState(null);
    const [copied, setCopied] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
    const [loginPassword, setLoginPassword] = useState("");
    const [itemDetails, setItemDetails] = useState(null);

    useEffect(() => {
        checkLink();
    }, [id]);

    const checkLink = async () => {
        try {
            const response = await fetch(`/api/secure-items/${id}`);
            const result = await response.json();
            
            if (result.status !== 'ready') {
                setError(result.message);
            } else {
                setItemDetails(result);
            }
        } catch (err) {
            setError("Invalid or expired link");
        }
    };

    const handleDecrypt = async () => {
        if (!loginPassword) {
            setError("Please enter your password");
            return;
        }

        try {
            setLoading(true);
            setError("");

            if (!isAuthenticated) {
                setError("Please login first to decrypt this message");
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            const response = await fetch(`/api/decrypt/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({}),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message);
            }

            const keyResponse = await api.get('/keys/my-private');
            if (!keyResponse.data.encrypted_private_key) {
                throw new Error("No private key found.");
            }
            
            const userPrivateKeyPem = await decryptPrivateKeyWithPassword(
                keyResponse.data.encrypted_private_key,
                loginPassword
            );
            
            const aesKey = await decryptAESKeyForRecipient(
                result.encrypted_aes_key,
                userPrivateKeyPem
            );
            
            const decryptedBuffer = await decryptWithAES(result.encrypted_data, aesKey);
            
            setShowPasswordPrompt(false);
            setLoginPassword("");

            if (result.type === "text") {
                const decodedText = new TextDecoder().decode(decryptedBuffer);
                setContent({ type: "text", data: decodedText });
            } else {
                const blob = new Blob([decryptedBuffer]);
                const url = window.URL.createObjectURL(blob);
                setContent({ type: "file", url, filename: result.filename || "secure-file" });
            }
        } catch (err) {
            setError(err.message || "Decryption failed. Please check your password.");
            setLoginPassword("");
        } finally {
            setLoading(false);
        }
    };

    const handleLoginRedirect = () => {
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/login');
    };

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <Shield className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!itemDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    if (showPasswordPrompt) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Key className="text-teal-600" size={28} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Decrypt Message</h2>
                        <p className="text-sm text-gray-500 mt-2">Enter your login password to unlock your private key</p>
                    </div>
                    
                    <input
                        type="password"
                        placeholder="Your login password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleDecrypt()}
                        className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl py-3 px-4 mb-4"
                        autoFocus
                    />
                    
                    <button
                        onClick={handleDecrypt}
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition"
                    >
                        {loading ? "Decrypting..." : "Decrypt Message"}
                    </button>
                    
                    {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                    
                    {!isAuthenticated && (
                        <button
                            onClick={handleLoginRedirect}
                            className="w-full mt-3 text-teal-600 text-sm hover:underline"
                        >
                            Login with different account
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (content) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Decrypted Content</h2>
                            <p className="text-sm text-gray-500">Securely decrypted with your private key</p>
                        </div>
                        <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full flex items-center gap-1">
                            <Shield size={12} /> Verified
                        </span>
                    </div>
                    
                    <hr className="border-gray-200 mb-6" />
                    
                    {content.type === "text" ? (
                        <div className="relative">
                            <textarea
                                readOnly
                                value={content.data}
                                className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 font-mono text-sm"
                                rows={10}
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(content.data);
                                    setCopied(true);
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                                className="absolute top-3 right-3 text-gray-500 hover:text-emerald-600 transition"
                            >
                                <Copy size={18} />
                            </button>
                            {copied && <p className="text-xs text-emerald-600 mt-2">Copied to clipboard ✓</p>}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-4">{content.filename}</p>
                            <a
                                href={content.url}
                                download={content.filename}
                                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-medium transition"
                            >
                                <Download size={18} />
                                Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="text-teal-600" size={40} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Secure Message</h1>
                <p className="text-gray-500 mb-6">
                    This message was encrypted for you. Click below to decrypt it.
                </p>
                <button
                    onClick={() => setShowPasswordPrompt(true)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition"
                >
                    Decrypt Message
                </button>
            </div>
        </div>
    );
}