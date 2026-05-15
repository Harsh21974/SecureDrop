import React, { useState, useEffect } from "react";
import { encryptForMultipleRecipients } from "../crypto/keys";
import { Copy, UploadCloud, Lock, FileText, Shield, Mail, User, X, Plus } from "lucide-react";
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
    const [recipients, setRecipients] = useState([]);
    const [emailInput, setEmailInput] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [dialogRecipients, setDialogRecipients] = useState([]);
    
    const { user } = useAuth();
    const isPremium = user?.is_premium || false;
    const MAX_TEXT_LENGTH = isPremium ? 50000 : 10000;
    const MAX_FILE_SIZE = isPremium ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    const MAX_RECIPIENTS = isPremium ? 20 : 1;
    const MAX_EXPIRY_DAYS = isPremium ? 30 : 7;
    const MAX_VIEWS = isPremium ? 100 : 10;

    const resetForm = () => {
        setText("");
        setCharCount(0);
        setFile(null);
        setExpiresIn(1440);
        setMaxViews(1);
        setRecipients([]);
        setEmailInput("");
    };

    const searchRecipient = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        
        setSearching(true);
        try {
            const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
            const filtered = response.data.filter(
                u => !recipients.some(r => r.id === u.id) && u.id !== user?.id
            );
            setSearchResults(filtered);
            setShowResults(filtered.length > 0);
        } catch (err) {
            console.error("Search failed:", err);
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const addRecipient = (recipient) => {
        if (recipients.length >= MAX_RECIPIENTS) {
            setErrorMessage(`You can only add ${MAX_RECIPIENTS} recipient(s). Free users: 1, Premium: Unlimited`);
            return;
        }
        if (!recipients.some(r => r.id === recipient.id)) {
            setRecipients([...recipients, recipient]);
        }
        setEmailInput("");
        setSearchResults([]);
        setShowResults(false);
    };

    const clearError = () => {
        setErrorMessage("");
    };
    
    const handleExpiryChange = (value) => {
        clearError();
    if (value > MAX_EXPIRY_DAYS * 24 * 60) {
        setErrorMessage(`Expiry cannot exceed ${MAX_EXPIRY_DAYS} days. Premium users: 30 days, Free: 7 days`);
        return;
    }
    setExpiresIn(value);
};

// Add max views validation
    const handleMaxViewsChange = (value) => {
        clearError();
        if (value > MAX_VIEWS) {
            setErrorMessage(`Max views cannot exceed ${MAX_VIEWS}. Premium users: 100, Free: 10`);
            return;
        }
        setMaxViews(value);
    };

    const addRecipientByEmail = async () => {
        if (!emailInput.trim()) return;
        
        if (emailInput === user?.email) {
            setErrorMessage("You cannot send a secure message to yourself");
            setEmailInput("");
            return;
        }
        
        // Check if already added
        if (recipients.some(r => r.email === emailInput)) {
            setErrorMessage("Recipient already added");
            setEmailInput("");
            return;
        }
        
        try {
            const response = await api.get(`/keys/public?email=${encodeURIComponent(emailInput)}`);
            const newRecipient = {
                id: response.data.user_id,
                name: response.data.name,
                email: response.data.email,
            };
            setRecipients([...recipients, newRecipient]);
            setEmailInput("");
        } catch (err) {
            setErrorMessage(`User with email ${emailInput} not found or does not have encryption keys`);
        }
    };

    const removeRecipient = (recipientId) => {
        setRecipients(recipients.filter(r => r.id !== recipientId));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addRecipientByEmail();
        }
    };

    const handleEncrypt = async () => {
        if (recipients.length === 0) {
            return setErrorMessage("Please add at least one recipient");
        }
        if (mode === "text" && !text) return setErrorMessage("Text cannot be empty");
        if (mode === "text" && text.length > MAX_TEXT_LENGTH) {
            return setErrorMessage(`Text exceeds ${MAX_TEXT_LENGTH.toLocaleString()} character limit`);
        }
        if (mode === "file" && !file) return setErrorMessage("Select a file");

        try {
            setLoading(true);
            setLink("");    

            let buffer;
            let filename = null;

            if (mode === "text") {
                buffer = new TextEncoder().encode(text);
            } else {
                if (file.size > MAX_FILE_SIZE) return setErrorMessage("File exceeds 20MB limit");
                buffer = await file.arrayBuffer();
                filename = file.name;
            }

            // Fetch public keys for all recipients
            const recipientsWithKeys = [];
            for (const recipient of recipients) {
                const keyResponse = await api.get(`/keys/public?email=${recipient.email}`);
                recipientsWithKeys.push({
                    user_id: recipient.id,
                    email: recipient.email,
                    publicKey: keyResponse.data.public_key,
                });
            }
            
            const encryptResult = await encryptForMultipleRecipients(buffer, recipientsWithKeys);
            
            const recipientsData = encryptResult.encryptedKeys.map(key => ({
                email: key.email,
                encrypted_key: key.encrypted_key,
            }));
            
            const response = await api.post('/secure-items', {
                type: mode,
                encrypted_data: encryptResult.encryptedData,
                filename,
                expires_in: expiresIn,
                max_views: maxViews,
                recipients: recipientsData,
                encryption_type: "public_key",
            });

            const result = response.data;

            if (result.email_sent) {
                setDialogRecipients([...recipients])
                setEmailSent(true);
                resetForm();
                setTimeout(() => setEmailSent(false), 3000);
            } else {
                setDialogRecipients([...recipients]);
                setLink(result.link);
                setShowDialog(true);
                resetForm();
            }
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'An error occurred';
            setErrorMessage(message);
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
            clearError();
        }
    };

    const ErrorMessage = ({ message, onClose }) => {
        useEffect(() => {
            if (message) {
                const timer = setTimeout(() => {
                    onClose();
                }, 5000);
                return () => clearTimeout(timer);
            }
        }, [message]);
        if (!message) return null;
        return (
            <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 max-w-sm">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-red-700">{message}</p>
                        </div>
                        <button onClick={onClose} className="flex-shrink-0 text-red-400 hover:text-red-600">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const handleDialogClose = () => {
        setShowDialog(false);
        setLink("");
        setDialogRecipients([]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-[400px] h-[400px] sm:w-[600px] sm:h-[600px] bg-teal-200/30 blur-3xl rounded-full"></div>

            <div className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-3xl mt-6 sm:mt-10">
                <div className="bg-white shadow-2xl border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10">
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 text-teal-700 mb-3">
                            <Shield size={20} />
                            <span className="uppercase text-xs tracking-widest font-medium">Multi-Recipient Encryption</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">Encrypt & Share Securely</h1>
                        <p className="text-gray-500 text-xs sm:text-sm mt-2">End-to-end encrypted with multiple recipients' public keys</p>
                    </div>
                    {/* ✅ PREMIUM BANNER FOR FREE USERS */}
                    {!isPremium && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-amber-600 text-lg">⚠️</span>
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold">Free Plan Limits:</p>
                                    <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                                        <li>5 messages per month</li>
                                        <li>20MB file size limit</li>
                                        <li>1 recipient per message</li>
                                        <li>10 max views</li>
                                        <li>7 days expiry</li>
                                    </ul>
                                    <a href="/pricing" className="font-semibold underline mt-2 inline-block">Upgrade to Premium →</a>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Recipients Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recipients <span className="text-red-500">*</span>
                        </label>
                        
                        {/* Selected recipients tags */}
                        {recipients.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {recipients.map(recipient => (
                                    <div key={recipient.id} className="bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5 text-sm flex items-center gap-2">
                                        <User size={14} className="text-teal-600" />
                                        <span className="text-teal-700">{recipient.name} ({recipient.email})</span>
                                        <button onClick={() => removeRecipient(recipient.id)} className="text-teal-500 hover:text-red-500">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Email input with button */}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    placeholder="Enter email address and press Enter or click Add"
                                    value={emailInput}
                                    onChange={(e) => {
                                        setEmailInput(e.target.value);
                                        clearError(); // ✅ Clear error when user types
                                    }}
                                    onKeyPress={handleKeyPress}
                                    className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl py-3 pl-10 pr-4 transition"
                                />
                            </div>
                            <button
                                onClick={addRecipientByEmail}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Add
                            </button>
                        </div>
                        
                        <p className="text-xs text-gray-500 mt-2">
                            Enter email addresses one by one. Each recipient must be a registered user with encryption keys.
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                        {["text", "file"].map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setMode(type);
                                    clearError(); // ✅ Clear error when switching modes
                                }}
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
                            <span className="text-xs text-gray-400 mt-1">Max file size: {isPremium ? '50MB' : '20MB'}</span>
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
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Max Views (per recipient)</p>
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
                            Your message is encrypted once with a random AES key. This key is then encrypted separately for each recipient using their public key.
                        </span>
                    </div>

                    <button 
                        onClick={handleEncrypt} 
                        disabled={loading || recipients.length === 0} 
                        className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-2xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Encrypting..." : `Encrypt & Send to ${recipients.length} Recipient${recipients.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
            {/* Full-screen Loading Overlay */}
            {loading && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
                        <p className="text-gray-700 font-medium">Encrypting your message...</p>
                        <p className="text-sm text-gray-400">Please wait while we secure your content</p>
                    </div>
                </div>
            )}

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
                            <div>📧 Sent to: {dialogRecipients.map(r => r.email).join(', ')}</div>
                            <div>⏱ Expires in {expiresIn === 60 ? "1 hour" : expiresIn === 720 ? "12 hours" : "24 hours"}</div>
                            <div>👁 Max views: {maxViews} per recipient</div>
                            <div className="text-red-500 font-medium">💣 Link self-destructs after limit</div>
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
                            <p className="text-sm text-gray-600">The secure link has been sent to {dialogRecipients.length} recipient(s).</p>
                        </div>
                        <button onClick={() => setEmailSent(false)} className="w-full mt-6 bg-teal-600 text-white py-2 rounded-xl">Continue</button>
                    </div>
                </div>
            )}

            {/* Error Message Toast */}
            <ErrorMessage message={errorMessage} onClose={() => setErrorMessage("")} />
        </div>
    );
}