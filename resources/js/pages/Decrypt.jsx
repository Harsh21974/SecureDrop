import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { decryptData } from "../aes";
import { Lock, Eye, EyeOff, Copy } from "lucide-react";

export default function Decrypt() {
    const { id } = useParams();
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [content, setContent] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [copied, setCopied] = useState(false);
    const [success, setSuccess] = useState(false);
    const [shake, setShake] = useState(false);
    const passwordRef = useRef(null);

    useEffect(() => {
        passwordRef.current?.focus();
    }, []);

    const handleCopy = async () => {
        if (!content?.data) return;

        await navigator.clipboard.writeText(content.data);
        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const handleDecrypt = async () => {
    if (!password) return alert("Password required");

    try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/decrypt/${id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({ password }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        const decryptedBuffer = await decryptData(
            result.encrypted_data,
            password
        );

        if (result.type === "text") {
            const decodedText = new TextDecoder().decode(decryptedBuffer);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 800);

            setContent({ type: "text", data: decodedText });
        } else {
            const blob = new Blob([decryptedBuffer]);
            const url = window.URL.createObjectURL(blob);

            setSuccess(true);
            setTimeout(() => setSuccess(false), 800);

            setContent({
                type: "file",
                url,
                filename: result.filename || "secure-file",
            });
        }
    } catch (err) {
        setError(err.message || "Invalid password or link.");

        setShake(true);
        setTimeout(() => setShake(false), 400);

        passwordRef.current?.focus();
    } finally {
        setLoading(false);
    }
};
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-32 -right-32 w-[400px] h-[400px] sm:w-[650px] sm:h-[650px] bg-emerald-200/40 blur-3xl rounded-full animate-pulse"></div>

            <div className="relative w-full max-w-md sm:max-w-lg">
                <div className="bg-white border border-gray-100 shadow-2xl rounded-3xl p-6 sm:p-8 transition-all duration-300 ease-in-out">
                    {!content && (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="flex items-center justify-center mb-3">
                                    <div className="bg-emerald-100 p-3.5 rounded-full flex items-center justify-center">
                                        <Lock className="text-emerald-600" size={22} />
                                    </div>
                                </div>
                                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                                    Protected Content
                                </h1>
                                <p className="text-sm text-gray-500 mt-2">
                                    Enter password to decrypt this information
                                </p>
                            </div>

                            {/* Password Input */}
                            <div className="relative mb-4">
                                <Lock
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                    size={18}
                                    />

                                <input
                                    ref={passwordRef}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter encryption password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleDecrypt();
                                        }
                                    }}
                                    className={`w-full border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl py-3.5 pl-11 pr-11 transition-all duration-200 ease-in-out ${shake ? "animate-shake" : ""}`}
                                />

                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4">
                                <Lock size={14} className="text-emerald-600" />
                                <span>
                                    Decryption happens locally in your browser. Your password is never sent to the server.
                                </span>
                            </div>
                            {/* Decrypt Button */}
                            <button
                                onClick={handleDecrypt}
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-semibold transition-all duration-200 ease-in-out shadow-lg hover:shadow-emerald-300/40 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Decrypting...
                                    </div>
                                ) : (
                                    "Decrypt Content"
                                )}
                            </button>

                            {error && (
                                <p className="text-red-500 text-sm mt-4 text-center">
                                    {error}
                                </p>
                            )}
                        </>
                    )}

                    {success && (
                        <div className="flex justify-center mb-4">
                            <div className="bg-emerald-100 text-emerald-600 py-3.5 rounded-full animate-scale-in">
                                ✓
                            </div>
                        </div>
                    )}
                    {/* Success State */}
                    {content && (
                        <>
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900">
                                            Decrypted Content
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Securely accessed and verified
                                        </p>
                                    </div>
                                    <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium flex items-center gap-1">
                                    ✓ Verified
                                    </span>
                                </div>
                                <hr className="border-gray-100 mb-4" />

                                {content.type === "text" && (
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            value={content.data}
                                            className="w-full resize-none bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 resize-none focus:outline-none shadow-inner"
                                        />

                                        <button
                                            onClick={handleCopy}
                                            className="absolute top-3 right-3 text-gray-500 hover:text-emerald-600 transition-all duration-200 ease-in-out hover:scale-110"
                                        >
                                            <Copy size={20} />
                                        </button>

                                        {copied && (
                                            <p className="text-xs text-emerald-600 mt-2">
                                                Copied to clipboard ✓
                                            </p>
                                        )}
                                    </div>
                                )}

                                {content.type === "file" && (
                                    <div className="text-center">
                                        <a
                                            href={content.url}
                                            download={content.filename}
                                            className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 sm:py-3.5 rounded-xl font-medium transition-all duration-200 ease-in-out hover:-translate-y-0.5 shadow-md hover:shadow-emerald-300/40"
                                        >
                                            Download File
                                        </a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}