import React, { useState } from "react";
import { encryptWithPublicKey } from "../crypto/keys";
import { Copy, UploadCloud, Lock, FileText, Eye, EyeOff, Shield, Mail, User, X } from "lucide-react";
import api from "../../src/api";                             
import { useAuth } from "../../src/contexts/AuthContext";

export default function Encrypt() {
    const [mode, setMode] = useState("text");
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [expiresIn, setExpiresIn] = useState(1440);
    const [loading, setLoading] = useState(false);
    const [link, setLink] = useState("");
    const [copied, setCopied] = useState(false);
    const [maxViews, setMaxViews] = useState(1);
    const [showDialog, setShowDialog] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [recipientEmail, setRecipientEmail] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [recipientId, setRecipientId] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [recipientPublicKey, setRecipientPublicKey] = useState(null);
    
    const { user } = useAuth();
    const MAX_TEXT_LENGTH = 50000;
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    const resetForm = () => {
        setText("");
        setCharCount(0);
        setFile(null);
        setExpiresIn(1440);
        setMaxViews(1);
        setRecipientEmail("");
        setRecipientName("");
        setRecipientId(null);
        setRecipientPublicKey(null);
        setSearchResults([]);
    };

    const searchRecipient = async (email) => {
        if (email.length < 3) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        
        setSearching(true);
        try {
            const response = await api.get(`/users/search?query=${encodeURIComponent(email)}`);
            setSearchResults(response.data);
            setShowResults(response.data.length > 0);
        } catch (err) {
            console.error("Search failed:", err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const selectRecipient = (user) => {
        setRecipientEmail(user.email);
        setRecipientName(user.name);
        setRecipientId(user.id);
        setShowResults(false);
        setSearchResults([]);
    };

    const clearRecipient = () => {
        setRecipientEmail("");
        setRecipientName("");
        setRecipientId(null);
        setRecipientPublicKey(null);
    };

    const fetchPublicKey = async (email) => {
        try {
            const response = await api.get(`/keys/public?email=${encodeURIComponent(email)}`);
            setRecipientPublicKey(response.data.public_key);
            return response.data.public_key;
        } catch (err) {
            throw new Error(err.response?.data?.message || "User does not have encryption keys");
        }
    };

    const handleEncrypt = async () => {
        // Validation
        if (!recipientEmail.trim()) {
            return alert("Please enter recipient email address");
        }
        if (mode === "text" && !text) return alert("Text cannot be empty");
        if (mode === "text" && text.length > MAX_TEXT_LENGTH) {
            return alert(`Text exceeds ${MAX_TEXT_LENGTH.toLocaleString()} character limit`);
        }
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

            // Fetch recipient's public key
            const publicKey = await fetchPublicKey(recipientEmail);
            
            // Encrypt with recipient's public key
            const encryptResult = await encryptWithPublicKey(buffer, publicKey);
            
            const response = await api.post('/secure-items', {
                type: mode,
                encrypted_data: encryptResult.encrypted,
                filename,
                expires_in: expiresIn,
                max_views: maxViews,
                recipient_email: recipientEmail,
                encryption_type: "public_key",
            });

            const result = response.data;

            if (result.email_sent) {
                setEmailSent(true);
                resetForm();
                setTimeout(() => setEmailSent(false), 3000);
            } else {
                setLink(result.link);
                setShowDialog(true);
                resetForm();
            }
        } catch (err) {
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

    const handleTextChange = (e) => {
        const newText = e.target.value;
        if (newText.length <= MAX_TEXT_LENGTH) {
            setText(newText);
            setCharCount(newText.length);
        }
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setRecipientEmail(email);
        setRecipientPublicKey(null);
        setRecipientName("");
        setRecipientId(null);
        searchRecipient(email);
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        setLink("");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-teal-200/30 blur-3xl rounded-full"></div>

            <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mt-6 sm:mt-10">
                <div className="bg-white shadow-2xl border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10">
                    {/* Title */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 text-teal-700 mb-3">
                            <Shield size={20} />
                            <span className="uppercase text-xs tracking-widest font-medium">Public Key Encryption</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">Encrypt & Share Securely</h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2">End-to-end encrypted with recipient's public key</p>
                    </div>

                    {/* Recipient Email Input - MANDATORY */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recipient Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="email"
                                required
                                placeholder="recipient@example.com"
                                value={recipientEmail}
                                onChange={handleEmailChange}
                                className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl py-3 pl-10 pr-4 transition"
                            />
                        </div>
                        
                        {/* Search Results */}
                        {showResults && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                {searching ? (
                                    <div className="p-4 text-center text-gray-500">Searching...</div>
                                ) : (
                                    searchResults.map(user => (
                                        <button
                                            key={user.id}
                                            onClick={() => selectRecipient(user)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100 last:border-0"
                                        >
                                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                                <User size={14} className="text-teal-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                        
                        {recipientName && (
                            <div className="mt-2 flex items-center gap-2">
                                <div className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2">
                                    <User size={14} className="text-teal-600" />
                                    <span className="text-teal-700">Encrypting for: {recipientName}</span>
                                    <button onClick={clearRecipient} className="text-teal-500 hover:text-red-500">
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                        
                        <p className="text-xs text-gray-500 mt-2">
                            The message will be encrypted with the recipient's public key. Only they can decrypt it.
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                        {["text", "file"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMode(type)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition ${
                                    mode === type ? "bg-white shadow-md text-teal-700 font-semibold" : "text-gray-500"
                                }`}
                            >
                                {type === "text" ? <FileText size={16} /> : <UploadCloud size={16} />}
                                {type === "text" ? "Text" : "File"}
                            </button>
                        ))}
                    </div>

                    {/* Text Area */}
                    {mode === "text" && (
                        <>
                            <textarea
                                rows={6}
                                className="w-full resize-none min-h-[120px] border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-2xl p-4 mb-2 bg-white"
                                placeholder="Enter your secret message... (Max 50,000 characters)"
                                value={text}
                                onChange={handleTextChange}
                            />
                            <div className="flex justify-end mb-6">
                                <span className={`text-xs ${charCount > MAX_TEXT_LENGTH ? 'text-red-500' : 'text-gray-400'}`}>
                                    {charCount.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()} characters
                                </span>
                            </div>
                        </>
                    )}

                    {/* File Upload */}
                    {mode === "file" && (
                        <label className="border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition mb-6">
                            <UploadCloud size={40} className="text-emerald-500" />
                            <span className="mt-3">{file ? file.name : "Click to upload secure file"}</span>
                            <span className="text-xs text-gray-400 mt-1">Max file size: 20MB</span>
                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                        </label>
                    )}

                    {/* Expiry */}
                    <select value={expiresIn} onChange={(e) => setExpiresIn(Number(e.target.value))} className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-2xl p-3 mb-6 bg-white">
                        <option value={60}>Expires in 1 Hour</option>
                        <option value={720}>Expires in 12 Hours</option>
                        <option value={1440}>Expires in 24 Hours</option>
                    </select>

                    {/* Max Views */}
                    <div className="mb-6">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Max Views</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[{ label: "Read Once", value: 1 }, { label: "5 Views", value: 5 }, { label: "10 Views", value: 10 }, { label: "100 Views", value: 100 }].map((option) => (
                                <button key={option.value} onClick={() => setMaxViews(option.value)} className={`p-3 rounded-xl border text-xs sm:text-sm font-medium transition ${
                                    maxViews === option.value ? "bg-teal-700 text-white border-teal-700" : "bg-white border-gray-200 text-gray-600 hover:border-emerald-400"
                                }`}>{option.label}</button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4">
                        <Shield size={14} className="text-teal-600 mt-[2px]" />
                        <span>
                            Encryption happens locally in your browser using the recipient's public key. 
                            The encrypted data can only be decrypted by the recipient's private key.
                        </span>
                    </div>

                    {/* Encrypt Button */}
                    <button onClick={handleEncrypt} disabled={loading || !recipientEmail.trim()} className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-2xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <><Lock size={16} className="animate-pulse" /> Encrypting...</> : "Encrypt & Send to Recipient"}
                    </button>
                </div>
            </div>

            {/* Link Dialog */}
            {showDialog && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
                        <button onClick={handleDialogClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔗 Secure Link Generated</h2>
                        <div className="flex gap-2">
                            <input value={link} readOnly className="flex-1 border border-gray-200 rounded-xl p-2 text-xs bg-gray-50" />
                            <button onClick={copyLink} className="bg-teal-700 hover:bg-teal-800 text-white px-4 rounded-xl">{copied ? "✓ Copied" : <Copy size={16} />}</button>
                        </div>
                        <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-gray-600">
                            <div className="flex items-center gap-2"><Shield size={12} className="text-teal-600" /> End-to-end encrypted</div>
                            <div>📧 Sent to: {recipientEmail}</div>
                            <div>⏱ Expires in {expiresIn === 60 ? "1 hour" : expiresIn === 720 ? "12 hours" : "24 hours"}</div>
                            <div>👁 Max views: {maxViews}</div>
                            <div className="text-red-500 font-medium">💣 Link self-destructs after the limit is reached</div>
                            <div className="text-teal-600 mt-1">🔐 Encrypted with recipient's public key</div>
                        </div>
                        <button onClick={handleDialogClose} className="w-full mt-4 bg-gray-100 hover:bg-gray-200 py-2 rounded-xl">Close</button>
                    </div>
                </div>
            )}

            {/* Email Sent Dialog */}
            {emailSent && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
                        <button onClick={() => setEmailSent(false)} className="absolute top-4 right-4 text-gray-400">✕</button>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">📧</div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Link Sent Successfully!</h2>
                            <p className="text-sm text-gray-600">The secure link has been sent to {recipientEmail}.</p>
                        </div>
                        <button onClick={() => setEmailSent(false)} className="w-full mt-6 bg-teal-600 text-white py-2 rounded-xl">Continue</button>
                    </div>
                </div>
            )}
        </div>
    );
}