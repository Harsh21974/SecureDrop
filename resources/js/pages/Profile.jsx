import React, { useState, useEffect } from 'react';
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/api";
import { Copy, Trash2, FileText, File, Clock, Eye, Link as LinkIcon, LogOut, Sparkles, Users, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PendingInvites from "./workspace/PendingInvites";

export default function Profile() {
    const { user, logout } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copiedToken, setCopiedToken] = useState(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const response = await api.get('/my-items');
            setItems(response.data);
        } catch (error) {
            console.error('Failed to fetch items', error);
        } finally {
            setLoading(false);
        }
    };

    const copyLink = (token) => {
        const link = `${window.location.origin}/decrypt/${token}`;
        navigator.clipboard.writeText(link);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000);
    };

    const deleteItem = async (token) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/my-items/${token}`);
            setItems(items.filter(item => item.token !== token));
        } catch (error) {
            alert('Failed to delete item');
        }
    };

    const getStatus = (item) => {
        const now = new Date();
        const expiresAt = new Date(item.expires_at);
        if (now > expiresAt) return { label: 'Expired', color: 'bg-red-100 text-red-700', icon: AlertCircle };
        if (item.view_count >= item.max_views) return { label: 'Used up', color: 'bg-orange-100 text-orange-700', icon: AlertCircle };
        return { label: 'Active', color: 'bg-green-100 text-green-700', icon: CheckCircle };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-teal-50/40 py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header Card with glassmorphism effect */}
                <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all hover:shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-100/40 to-indigo-100/40 rounded-full blur-3xl -z-0"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    {user?.name}
                                </h1>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-xs">
                            <span className={`px-3 py-1.5 rounded-full font-medium shadow-sm backdrop-blur-sm ${user?.is_premium ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                                {user?.is_premium ? (
                                    <span className="flex items-center gap-1"><Sparkles size={12} /> Premium</span>
                                ) : 'Free'}
                            </span>
                            <span className="text-gray-400 text-xs">
                                Joined {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="group flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" /> 
                        Logout
                    </button>
                </div>

                {/* Invites */}
                <PendingInvites />

                {/* Workspaces Card */}
                <div className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-5 flex justify-between items-center border border-gray-100 hover:border-teal-200">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Users size={20} className="text-teal-600" />
                            Workspaces
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage your shared secure environments</p>
                    </div>
                    <a href="/workspaces" className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors group-hover:gap-2">
                        Open <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </a>
                </div>

                {/* Items Section */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
                    <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <LinkIcon size={22} className="text-teal-600" />
                            Your Secure Links
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Manage and share your encrypted secrets</p>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 font-medium">Loading your secure links...</p>
                            </div>
                        ) : items.length === 0 ? (
                            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-teal-50/20 rounded-2xl">
                                <div className="w-20 h-20 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <LinkIcon size={32} className="text-teal-600" />
                                </div>
                                <p className="text-gray-600 font-medium mb-1">No secure links yet</p>
                                <p className="text-sm text-gray-400">Create your first secure link to get started</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {items.map((item, idx) => {
                                    const status = getStatus(item);
                                    const StatusIcon = status.icon;
                                    return (
                                        <div 
                                            key={item.token} 
                                            className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-teal-200 hover:scale-[1.01]"
                                        >
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2.5 rounded-xl transition-all duration-200 ${status.label === 'Active' ? 'bg-teal-100 text-teal-700 group-hover:bg-teal-200' : 'bg-gray-100 text-gray-500'}`}>
                                                        {item.type === 'text' ? <FileText size={20} /> : <File size={20} />}
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-base">
                                                            {item.type === 'text' ? 'Text Secret' : item.filename || 'File'}
                                                        </p>

                                                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
                                                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                                                                <Clock size={12} className="text-gray-400" /> 
                                                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                            </span>
                                                            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full">
                                                                <Eye size={12} className="text-gray-400" /> 
                                                                {item.view_count}/{item.max_views} views
                                                            </span>
                                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                                                                <StatusIcon size={12} />
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 ml-14 sm:ml-0">
                                                    <button
                                                        onClick={() => copyLink(item.token)}
                                                        className="relative p-2.5 rounded-xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all duration-200 group/btn"
                                                        title="Copy secure link"
                                                    >
                                                        {copiedToken === item.token ? (
                                                            <CheckCircle size={18} className="text-green-600" />
                                                        ) : (
                                                            <Copy size={18} />
                                                        )}
                                                        {copiedToken === item.token && (
                                                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-800 text-white px-2 py-1 rounded whitespace-nowrap">
                                                                Copied!
                                                            </span>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => deleteItem(item.token)}
                                                        className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                                                        title="Delete item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}