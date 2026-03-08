import React, { useState } from "react";
import { encryptData } from "../aes";
import { Copy, UploadCloud, Lock, FileText, Eye, EyeOff } from "lucide-react";

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

            const response = await fetch("/api/secure-items", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    type: mode,
                    encrypted_data: encryptedBase64,
                    filename,
                    password: password,
                    expires_in: expiresIn,
                    max_views: maxViews,
                    recipients: emails.filter(e => e.trim() !== "")
                }),
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            if (result.email_sent) {
                setEmailSent(true);
            } else {
                setLink(result.link);
                setShowDialog(true);
            }
        } catch (err) {
            alert(err.message);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Soft Background Glow */}
            <div className="absolute w-[600px] h-[600px] bg-emerald-200/40 blur-3xl rounded-full"></div>

            <div className="relative w-full max-w-xl scale-[0.8] origin-top">
                <div className="bg-white shadow-2xl border border-gray-100 rounded-3xl p-10 transition-all duration-500">
                    {/* Title */}
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-2 text-emerald-600 mb-3">
                            <Lock size={20} />
                            <span className="uppercase text-xs tracking-widest font-medium">
                                Secure Encryption
                            </span>
                        </div>
                        <h1 className="text-3xl font-semibold text-gray-900">
                            Encrypt & Share Securely
                        </h1>
                        <p className="text-gray-500 text-sm mt-2">
                            End-to-end encrypted sharing with expiring links.
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-8">
                        {["text", "file"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMode(type)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all duration-300 ${
                                    mode === type
                                        ? "bg-white shadow text-emerald-600 font-semibold"
                                        : "text-gray-500 hover:text-gray-900"
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
                            rows="6"
                            placeholder="Enter your secret message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl p-4 mb-6 transition bg-white"
                        />
                    )}

                    {/* File Upload */}
                    {mode === "file" && (
                        <label className="border-2 border-dashed border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 rounded-2xl p-10 flex flex-col items-center justify-center text-gray-500 cursor-pointer transition mb-6">
                            <UploadCloud size={40} className="text-emerald-500" />
                            <span className="mt-3">
                                {file ? file.name : "Click to upload secure file"}
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
                        <Lock className="absolute left-4 top-3 text-gray-400" size={18} />

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter encryption password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl p-3 pl-12 pr-12 transition"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3 text-gray-400 hover:text-gray-700 transition"
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
                            <p className="text-xs mt-2 text-gray-500">
                                Strength: {passwordStrength()}
                            </p>
                        </div>
                    )}

                    {/* Expiry */}
                    <select
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(Number(e.target.value))}
                        className="w-full border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-2xl p-3 mb-8 transition bg-white"
                    >
                        <option value={60}>Expires in 1 Hour</option>
                        <option value={720}>Expires in 12 Hours</option>
                        <option value={1440}>Expires in 24 Hours</option>
                    </select>

                    <div className="mb-8">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                            Max Views
                        </p>
                        <div className="grid grid-cols-2 gap-3">
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
                                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                                        maxViews === option.value
                                            ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600"
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allowed Emails */}
                    <div className="mb-8">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                            Allowed Recipient Emails
                        </p>
                        {emails.map((email, index) => (
                            <div key={index} className="flex gap-2 mb-2">
                                <input
                                    type="email"
                                    placeholder="Enter recipient email"
                                    value={email}
                                    onChange={(e) => {
                                        const updated = [...emails];
                                        updated[index] = e.target.value;
                                        setEmails(updated);
                                    }}
                                    className="flex-1 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 rounded-xl p-3 transition"
                                />
                                {emails.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEmails(emails.filter((_, i) => i !== index));
                                        }}
                                        className="px-3 bg-red-100 text-red-500 rounded-xl hover:bg-red-200"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setEmails([...emails, ""])}
                            className="text-emerald-600 text-sm font-medium hover:underline mt-2"
                        >
                            + Add Another Email
                        </button>
                    </div>

                    {/* Encrypt Button */}
                    <button
                        onClick={handleEncrypt}
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-300/40"
                    >
                        {loading ? "Encrypting..." : "Generate Secure Link"}
                    </button>
                </div>
            </div>

            {showDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
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
                                className="flex-1 border border-gray-200 rounded-xl p-2 text-sm"
                            />
                            <button
                                onClick={copyLink}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl transition"
                            >
                                {copied ? "Copied" : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            This link will expire automatically.
                        </p>
                    </div>
                </div>
            )}

            {/* Link Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
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
                                className="flex-1 border border-gray-200 rounded-xl p-2 text-sm"
                            />
                            <button
                                onClick={copyLink}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl transition"
                            >
                                {copied ? "Copied" : <Copy size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">
                            This link will expire automatically.
                        </p>
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
                        <p className="text-sm text-gray-600">
                            The secure link has been sent to the specified recipient(s).
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}