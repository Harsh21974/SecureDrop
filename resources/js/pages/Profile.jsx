import React, { useState, useEffect } from 'react';
import { useAuth } from "../../src/contexts/AuthContext";
import api from "../../src/api";        
import { Copy, Trash2, FileText, File, Clock, Eye, Link as LinkIcon } from 'lucide-react';
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

    const handleInviteAccepted = (workspaceId) => {
        console.log('Invite accepted for workspace:', workspaceId);
        // Optional: Refresh workspace list or show a success toast
    };
    
    const getStatus = (item) => {
        const now = new Date();
        const expiresAt = new Date(item.expires_at);
        if (now > expiresAt) return { label: 'Expired', color: 'text-red-600 bg-red-50' };
        if (item.view_count >= item.max_views) return { label: 'Used up', color: 'text-orange-600 bg-orange-50' };
        return { label: 'Active', color: 'text-green-600 bg-green-50' };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <PendingInvites onInviteAccepted={handleInviteAccepted} />
                </div>
                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                            <p className="text-gray-500">{user?.email}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user?.is_premium ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {user?.is_premium ? 'Premium' : 'Free'}
                                </span>
                                <span className="text-sm text-gray-500">Member since {new Date(user?.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Workspaces</h2>
                    <p className="text-sm text-gray-500 mb-3">
                        Collaborate securely with your team using workspaces.
                    </p>
                    <a
                        href="/workspaces"
                        className="text-teal-600 hover:underline font-medium"
                    >
                        Go to Workspaces →
                    </a>
                </div>

                {/* Items List */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Secure Links</h2>

                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <LinkIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p>You haven't created any secure links yet.</p>
                            <a href="/encrypt" className="text-teal-600 hover:underline mt-2 inline-block">Create your first link</a>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map((item) => {
                                const status = getStatus(item);
                                return (
                                    <div key={item.token} className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-teal-50 p-2 rounded-lg">
                                                    {item.type === 'text' ? <FileText size={20} className="text-teal-600" /> : <File size={20} className="text-teal-600" />}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">
                                                        {item.type === 'text' ? 'Text Secret' : item.filename || 'File'}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={12} /> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Eye size={12} /> {item.view_count}/{item.max_views} views
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                                            {status.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-auto">
                                                <button
                                                    onClick={() => copyLink(item.token)}
                                                    className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"
                                                    title="Copy link"
                                                >
                                                    {copiedToken === item.token ? '✓' : <Copy size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(item.token)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Delete"
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
    );
}