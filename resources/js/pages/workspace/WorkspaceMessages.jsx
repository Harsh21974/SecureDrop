import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../src/api";
import { useAuth } from "../../../src/contexts/AuthContext";
import { 
    Inbox, 
    Send, 
    Mail, 
    Eye, 
    Trash2, 
    Users,
    ArrowLeft,
    Loader2,
    CheckCircle,
    Clock
} from "lucide-react";

const WorkspaceMessages = () => {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [sentMessages, setSentMessages] = useState([]);
    const [receivedMessages, setReceivedMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("received");
    const [workspaceInfo, setWorkspaceInfo] = useState(null);

    useEffect(() => {
        fetchWorkspaceInfo();
        fetchMessages();
    }, [workspaceId]);

    const fetchWorkspaceInfo = async () => {
        try {
            const response = await api.get(`/workspaces/${workspaceId}`);
            setWorkspaceInfo(response.data);
        } catch (err) {
            console.error("Failed to fetch workspace:", err);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await api.get(`/workspaces/${workspaceId}/messages`);
            setSentMessages(response.data.sent);
            setReceivedMessages(response.data.received);
        } catch (err) {
            console.error("Failed to fetch messages:", err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await api.post(`/workspaces/${workspaceId}/messages/${messageId}/read`);
            fetchMessages();
        } catch (err) {
            console.error("Failed to mark as read:", err);
        }
    };

    const deleteMessage = async (messageId) => {
        if (!confirm("Delete this message?")) return;
        try {
            await api.delete(`/workspaces/${workspaceId}/messages/${messageId}`);
            fetchMessages();
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (hours < 24) {
            return `${hours}h ago`;
        } else if (hours < 168) {
            return `${Math.floor(hours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    };

    const MessageCard = ({ message, type }) => {
        const isReceived = type === "received";
        const displayName = isReceived ? message.sender_name : message.recipient_name;
        const isRead = message.is_read;
        
        return (
            <div className={`border border-gray-200 rounded-xl p-4 hover:shadow-md transition ${!isRead && isReceived ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-teal-700">
                                    {displayName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{displayName}</p>
                                <p className="text-xs text-gray-400">{formatTime(message.created_at)}</p>
                            </div>
                            {!isRead && isReceived && (
                                <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">New</span>
                            )}
                        </div>
                        
                        <p className="text-gray-700 font-medium mb-1">
                            {message.subject || "(No subject)"}
                        </p>
                        
                        <div className="flex items-center gap-4 mt-3">
                            <button
                                onClick={() => window.open(`/decrypt/${message.token}`, '_blank')}
                                className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                            >
                                <Eye size={14} />
                                Decrypt & View
                            </button>
                            
                            {isReceived && !isRead && (
                                <button
                                    onClick={() => markAsRead(message.id)}
                                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    <CheckCircle size={14} />
                                    Mark as Read
                                </button>
                            )}
                            
                            <button
                                onClick={() => deleteMessage(message.id)}
                                className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500"
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-teal-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/workspaces/${workspaceId}`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                            <Mail className="text-teal-600" size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Secure Messages</h1>
                            <p className="text-sm text-gray-500">{workspaceInfo?.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("received")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                            activeTab === "received"
                                ? "bg-teal-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <Inbox size={16} />
                        Received
                        {receivedMessages.length > 0 && (
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                activeTab === "received" ? "bg-white/20" : "bg-gray-200"
                            }`}>
                                {receivedMessages.length}
                            </span>
                        )}
                    </button>
                    
                    <button
                        onClick={() => setActiveTab("sent")}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                            activeTab === "sent"
                                ? "bg-teal-600 text-white"
                                : "bg-white text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                        <Send size={16} />
                        Sent
                    </button>
                </div>

                {/* Messages List */}
                {activeTab === "received" && (
                    <>
                        {receivedMessages.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Mail className="mx-auto text-gray-400 mb-4" size={48} />
                                <h3 className="text-lg font-medium text-gray-700 mb-1">No messages yet</h3>
                                <p className="text-sm text-gray-400">
                                    When someone sends you a secure message, it will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {receivedMessages.map((message) => (
                                    <MessageCard key={message.id} message={message} type="received" />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {activeTab === "sent" && (
                    <>
                        {sentMessages.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                                <Send className="mx-auto text-gray-400 mb-4" size={48} />
                                <h3 className="text-lg font-medium text-gray-700 mb-1">No sent messages</h3>
                                <p className="text-sm text-gray-400">
                                    Messages you send will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {sentMessages.map((message) => (
                                    <MessageCard key={message.id} message={message} type="sent" />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default WorkspaceMessages;