import React, { useState } from "react";
import { encryptData } from "../aes";
import { Copy, UploadCloud, Lock, FileText, Eye, EyeOff } from "lucide-react";
import api from "../../src/api";                               // ✅ correct path to api.js
import { useAuth } from "../../src/contexts/AuthContext";

export default function Encrypt() {
    const [mode, setMode] = useState("text");
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState("");
    const [expiresIn, setExpiresIn] = useState(1440);
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [maxViews, setMaxViews] = useState(1);
    const [showDialog, setShowDialog] = useState(false);
    const [emails, setEmails] = useState([""]);
    const [emailSent, setEmailSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { user } = useAuth();

    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    const passwordStrength = () => {
        if (password.length > 10) return "Strong";
        if (password.length > 6) return "Medium";
        if (password.length > 0) return "Weak";
        return "";
    };

    const handleEncrypt = async () => {
        if (!password) return alert("Password required");
        if (mode === "text" && !text) return alert("Text cannot be empty");
        if (mode === "file" && !file) return alert("Select a file");

        try {
            setLoading(true);
            setLink("");    

            let buffer;
            let filename = null;

            if (mode === "text") {
                buffer = new TextEncoder().encode(text);
            } else {
                if (file.size > MAX_FILE_SIZE) return alert("File exceeds 20MB limit");
                buffer = await file.arrayBuffer();
                filename = file.name;
            }

            const encryptedBase64 = await encryptData(buffer, password);

            // ✅ Use api.post (axios) – no need for response.json()
            const response = await api.post('/secure-items', {
                type: mode,
                encrypted_data: encryptedBase64,
                filename,
                password: password,
                expires_in: expiresIn,
                max_views: maxViews,
                recipients: emails.filter(e => e.trim() !== "")
            });

            const result = response.data; // ✅ Axios automatically parses JSON

            if (result.email_sent) {
                setEmailSent(true);
            } else {
                setLink(result.link);
                setShowDialog(true);
            }
        } catch (err) {
            // Extract error message from server response if available
            const message = err.response?.data?.message || err.message || 'An error occurred';
            alert(message);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Soft Background Glow */}
            <div className="absolute -top-32 -right-32 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-teal-200/30 blur-3xl rounded-full"></div>

            <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mt-6 sm:mt-10">
                <div className="bg-white shadow-2xl border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.01]">
                    {/* Title */}
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 text-teal-700 mb-3">
                            <Lock size={20} />
                            <span className="uppercase text-xs tracking-widest font-medium">
                                Secure Encryption
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
                            Encrypt & Share Securely
                        </h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2">
                            End-to-end encrypted sharing with expiring links.
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-10">
                        {["text", "file"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMode(type)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-200 ease-in-out ${
                                    mode === type
                                        ? "bg-white shadow-md text-teal-700 font-semibold"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                                }`}
                            >
                                {type === "text" ? (
                                    <>
                                        <FileText size={16} /> Text
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={16} /> File
                                    </>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Text Area */}
                    {mode === "text" && (
                        <textarea
                            rows={6}
                            className="w-full resize-none min-h-[120px] sm:min-h-[150px] border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-2xl p-4 mb-6 transition-all duration-200 ease-in-out bg-white"
                            placeholder="Enter your secret message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                    )}

                    {/* File Upload */}
                    {mode === "file" && (
                        <label className="border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50 rounded-2xl p-6 sm:p-8 lg:p-10 flex flex-col items-center justify-center text-gray-500 cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 mb-6">
                            <UploadCloud size={40} className="text-emerald-500" />
                            <span className="mt-3">
                                {file ? file.name : "Click to upload secure file"}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">
                            Max file size: 20MB
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </label>
                    )}

                    {/* Password */}
                    <div className="relative mb-4">
                        <Lock
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                            size={18}
                            />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter encryption password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-2xl p-3 pl-12 pr-12 transition-all duration-200 ease-in-out"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition"  
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Password Strength */}
                    {password && (
                        <div className="mb-6">
                            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        passwordStrength() === "Strong"
                                            ? "bg-emerald-500 w-full"
                                            : passwordStrength() === "Medium"
                                            ? "bg-yellow-400 w-2/3"
                                            : "bg-red-400 w-1/3"
                                    }`}
                                />
                            </div>
                            <p className={`text-xs mt-2 font-medium ${
                                passwordStrength() === "Strong"
                                ? "text-emerald-600"
                                : passwordStrength() === "Medium"
                                ? "text-yellow-600"
                                : "text-red-500"
                                }`}>
                                Strength: {passwordStrength()}
                            </p>
                        </div>
                    )}

                    {/* Expiry */}
                    <select
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(Number(e.target.value))}
                        className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-2xl p-3 mb-10 transition-all duration-200 ease-in-out bg-white"
                    >
                        <option value={60}>Expires in 1 Hour</option>
                        <option value={720}>Expires in 12 Hours</option>
                        <option value={1440}>Expires in 24 Hours</option>
                    </select>

                    <div className="mb-10">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                            Max Views
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { label: "Read Once", value: 1 },
                                { label: "5 Views", value: 5 },
                                { label: "10 Views", value: 10 },
                                { label: "100 Views", value: 100 },
                            ].map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setMaxViews(option.value)}
                                    className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 ease-in-out hover:-translate-y-0.5 ${
                                        maxViews === option.value
                                            ? "bg-teal-700 text-white border-teal-700 shadow-md"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allowed Emails */}
                    <div className="mb-10">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                            Allowed Recipient Emails
                        </p>
                        {emails.map((email, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2">
                                <input
                                    type="email"
                                    placeholder="Enter recipient email"
                                    value={email}
                                    onChange={(e) => {
                                        const updated = [...emails];
                                        updated[index] = e.target.value;
                                        setEmails(updated);
                                    }}
                                    className="flex-1 border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl p-3 transition-all duration-200 ease-in-out"
                                />
                                {emails.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmails(emails.filter((_, i) => i !== index));
                                        }}
                                        className="px-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200 transition-all duration-200 ease-in-out hover:scale-105"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setEmails([...emails, ""])}
                            className="text-emerald-600 text-xs sm:text-sm font-medium hover:underline mt-2 transition-all duration-200 ease-in-out hover:translate-x-1"
                        >
                            + Add Another Email
                        </button>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                        <Lock size={14} className="text-teal-600 mt-[2px]" />
                        <span>
                            Encryption happens locally in your browser. Your data is never sent to the server unencrypted. 
                            If you forget the password, the encrypted data cannot be recovered.
                        </span>
                    </div>

                    {/* Encrypt Button */}
                    <button
                        onClick={handleEncrypt}
                        disabled={loading}
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-2xl font-semibold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 shadow-lg hover:shadow-teal-400/30 hover:-translate-y-0.5 active:scale-95"
                    >
                        {loading ? (
                        <>
                            <Lock size={16} className="animate-pulse" />
                            Encrypting...
                        </>
                        ) : (
                        "Generate Secure Link"
                        )}
                    </button>
                </div>
            </div>

            {showDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md sm:max-w-lg relative animate-scale-in">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowDialog(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Your Encrypted Link
                        </h2>
                        <div className="flex gap-2">
                            <input
                                value={link}
                                readOnly
                                className="flex-1 border border-gray-200 rounded-xl p-2 text-xs sm:text-sm"
                            />
                            <button
                                onClick={copyLink}
                                className="bg-teal-700 hover:bg-teal-800 text-white px-4 rounded-xl transition-all duration-200 ease-in-out hover:scale-105"
                            >
                                {copied ? "Copied" : <Copy size={16} />}
                            </button>
                        </div>
                        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-2">
                                <Lock size={12} className="text-teal-600" />
                                End-to-end encrypted
                            </div>

                            <div>
                                ⏱ Expires in {expiresIn === 60 ? "1 hour" : expiresIn === 720 ? "12 hours" : "24 hours"}
                            </div>

                            <div>
                                👁 Max views: {maxViews}
                            </div>

                            <div className="text-red-500 font-medium">
                                💣 Link self-destructs after the limit is reached
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Email Sent Dialog */}
            {emailSent && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
                        <button
                            onClick={() => setEmailSent(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg"
                        >
                            ✕
                        </button>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            📧 Link Sent Successfully
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600">
                            The secure link has been sent to the specified recipient(s).
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}