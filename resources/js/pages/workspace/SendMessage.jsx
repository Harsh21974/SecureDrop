import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../../../src/api";
import { useAuth } from "../../../src/contexts/AuthContext";
import { encryptWithPublicKey, encryptForMultipleRecipients } from "../../crypto/keys";
import { Lock, UploadCloud, FileText, Shield, ArrowLeft, Send, User, X, Plus } from "lucide-react";

const SendMessage = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    
    const [recipients, setRecipients] = useState([]);
    const [subject, setSubject] = useState("");
    const [mode, setMode] = useState("text");
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [expiresIn, setExpiresIn] = useState(1440);
    const [maxViews, setMaxViews] = useState(1);
    const [loading, setLoading] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [fetching, setFetching] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    
    const MAX_TEXT_LENGTH = 50000;
    const MAX_FILE_SIZE = 20 * 1024 * 1024;

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const recipientParam = params.get('recipient');
        const recipientsParam = params.get('recipients');
        
        if (recipientsParam) {
            // Multiple recipients (comma-separated IDs)
            const recipientIds = recipientsParam.split(',').map(id => parseInt(id));
            fetchMultipleRecipients(recipientIds);
        } else if (recipientParam) {
            // Single recipient
            fetchSingleRecipient(recipientParam);
        } else {
            setFetching(false);
            alert("No recipients specified");
            navigate(`/workspaces/${workspaceId}`);
        }
    }, [location, workspaceId]);

    const fetchSingleRecipient = async (recipientId) => {
        try {
            const response = await api.get(`/users/${recipientId}`);
            setRecipients([response.data]);
        } catch (err) {
            console.error("Failed to fetch recipient:", err);
            alert("Could not load recipient information");
            navigate(`/workspaces/${workspaceId}`);
        } finally {
            setFetching(false);
        }
    };

    const fetchMultipleRecipients = async (recipientIds) => {
        try {
            const fetchedRecipients = [];
            for (const id of recipientIds) {
                const response = await api.get(`/users/${id}`);
                fetchedRecipients.push(response.data);
            }
            setRecipients(fetchedRecipients);
        } catch (err) {
            console.error("Failed to fetch recipients:", err);
            alert("Could not load recipient information");
            navigate(`/workspaces/${workspaceId}`);
        } finally {
            setFetching(false);
        }
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

    const addRecipient = (newRecipient) => {
        if (!recipients.some(r => r.id === newRecipient.id)) {
            setRecipients([...recipients, newRecipient]);
        }
        setSearchTerm("");
        setSearchResults([]);
        setShowResults(false);
    };

    const removeRecipient = (recipientId) => {
        setRecipients(recipients.filter(r => r.id !== recipientId));
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        searchRecipient(value);
    };

    const handleSend = async () => {
        if (recipients.length === 0) {
            alert("Please add at least one recipient");
            return;
        }
        if (mode === "text" && !text) {
            alert("Message cannot be empty");
            return;
        }
        if (mode === "file" && !file) {
            alert("Please select a file");
            return;
        }

        setLoading(true);
        
        try {
            let buffer;
            let filename = null;
            
            if (mode === "text") {
                buffer = new TextEncoder().encode(text);
            } else {
                if (file.size > MAX_FILE_SIZE) {
                    alert("File exceeds 20MB limit");
                    setLoading(false);
                    return;
                }
                buffer = await file.arrayBuffer();
                filename = file.name;
            }

            // For workspace messages, we need to send to each recipient separately
            // or send to the workspace with recipient specified
            // Currently, send to first recipient only (simplified)
            for (const recipient of recipients) {
                // Fetch recipient's public key
                const keyResponse = await api.get(`/keys/public?email=${recipient.email}`);
                const encryptResult = await encryptWithPublicKey(buffer, keyResponse.data.public_key);
                
                // ✅ Use the CORRECT endpoint
                await api.post(`/workspaces/${workspaceId}/messages`, {
                    recipient_id: recipient.id,
                    subject: subject,
                    type: mode,
                    encrypted_data: encryptResult.encrypted,
                    filename: filename,
                    expires_in: expiresIn,
                    max_views: maxViews,
                });
            }
            
            alert(`Message sent successfully to ${recipients.length} recipient(s)!`);
            navigate(`/workspaces/${workspaceId}/messages`);
        } catch (err) {
            console.error("Failed to send:", err);
            alert(err.response?.data?.message || "Failed to send message");
        } finally {
            setLoading(false);
        }
    };

    const handleTextChange = (e) => {
        const newText = e.target.value;
        if (newText.length <= MAX_TEXT_LENGTH) {
            setText(newText);
            setCharCount(newText.length);
        }
    };

    if (fetching) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate(`/workspaces/${workspaceId}/messages`)}
                        className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition mb-4"
                    >
                        <ArrowLeft size={20} />
                        Back to Messages
                    </button>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                <Shield className="text-teal-600" size={24} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Send Secure Message</h1>
                                <p className="text-sm text-gray-500">
                                    To: {recipients.map(r => r.name).join(', ')} ({recipients.length} recipient{recipients.length !== 1 ? 's' : ''})
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    {/* Recipients Section - Show selected recipients */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Recipients <span className="text-red-500">*</span>
                        </label>
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
                        
                        {/* Add more recipients */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Add more recipients by name or email..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                                className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl py-2.5 px-4 transition"
                            />
                            {showResults && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                                    {searching ? (
                                        <div className="p-4 text-center text-gray-500">Searching...</div>
                                    ) : (
                                        searchResults.map(user => (
                                            <button
                                                key={user.id}
                                                onClick={() => addRecipient(user)}
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
                        </div>
                    </div>

                    {/* Subject */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject (Optional)
                        </label>
                        <input
                            type="text"
                            placeholder="What's this about?"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-2.5 transition"
                        />
                    </div>
                    
                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                        {["text", "file"].map((type) => (
                            <button
                                key={type}
                                onClick={() => setMode(type)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
                                    mode === type
                                        ? "bg-white shadow-sm text-teal-700 font-semibold"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {type === "text" ? <FileText size={16} /> : <UploadCloud size={16} />}
                                {type === "text" ? "Text Message" : "File Attachment"}
                            </button>
                        ))}
                    </div>
                    
                    {/* Text Area */}
                    {mode === "text" && (
                        <>
                            <textarea
                                rows={8}
                                className="w-full resize-none border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl p-4 mb-2 bg-white"
                                placeholder="Type your secure message..."
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
                        <label className="border-2 border-dashed border-gray-300 hover:border-teal-400 hover:bg-teal-50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition mb-6">
                            <UploadCloud size={40} className="text-teal-500 mb-3" />
                            <span className="text-sm text-gray-600">
                                {file ? file.name : "Click to upload file"}
                            </span>
                            <span className="text-xs text-gray-400 mt-1">Max file size: 20MB</span>
                            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                        </label>
                    )}
                    
                    {/* Expiry & Max Views */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expires In</label>
                            <select
                                value={expiresIn}
                                onChange={(e) => setExpiresIn(Number(e.target.value))}
                                className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-2.5 bg-white"
                            >
                                <option value={60}>1 Hour</option>
                                <option value={720}>12 Hours</option>
                                <option value={1440}>24 Hours</option>
                                <option value={4320}>3 Days</option>
                                <option value={10080}>7 Days</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Max Views (per recipient)</label>
                            <select
                                value={maxViews}
                                onChange={(e) => setMaxViews(Number(e.target.value))}
                                className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl px-4 py-2.5 bg-white"
                            >
                                <option value={1}>Read Once</option>
                                <option value={5}>5 Views</option>
                                <option value={10}>10 Views</option>
                                <option value={100}>100 Views</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-xl p-3 mb-6">
                        <div className="flex items-start gap-2">
                            <Lock size={14} className="text-teal-600 mt-0.5" />
                            <p className="text-xs text-gray-500">
                                This message will be encrypted once and securely delivered to all {recipients.length} recipient(s). Each recipient will use their own private key to decrypt.
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={handleSend}
                        disabled={loading || recipients.length === 0}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                            <Send size={18} />
                        )}
                        {loading ? "Encrypting & Sending..." : `Encrypt & Send to ${recipients.length} Recipient${recipients.length !== 1 ? 's' : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendMessage;