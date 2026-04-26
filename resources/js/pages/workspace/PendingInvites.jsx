import React, { useEffect, useState } from "react";
import api from "../../../src/api"; 
import { Mail, CheckCircle, XCircle, Clock, Users, Loader2 } from "lucide-react";

const PendingInvites = ({ onInviteAccepted }) => {
    const [invites, setInvites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptingId, setAcceptingId] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchPendingInvites();
    }, []);

    const fetchPendingInvites = async () => {
        try {
            const response = await api.get('/pending-invites');
            setInvites(response.data);
        } catch (err) {
            console.error('Failed to fetch invites:', err);
        } finally {
            setLoading(false);
        }
    };

    const acceptInvite = async (invite) => {
        setAcceptingId(invite.id);
        setMessage(null);
        
        try {
            const response = await api.post(`/accept-invite/${invite.token}`);
            
            if (response.data.message) {
                setMessage({ type: 'success', text: `✓ You joined ${invite.workspace_name}!` });
                
                // Remove from list
                const updatedInvites = invites.filter(i => i.id !== invite.id);
                setInvites(updatedInvites);
                
                if (onInviteAccepted) {
                    onInviteAccepted(invite.workspace_id);
                }
                
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (err) {
            setMessage({ 
                type: 'error', 
                text: err.response?.data?.message || 'Failed to accept invitation' 
            });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setAcceptingId(null);
        }
    };

    
    const declineInvite = async (invite) => {
        try {
            await api.delete(`/pending-invites/${invite.id}`);
            setInvites(invites.filter(i => i.id !== invite.id));
            setMessage({ type: 'info', text: `Invitation to ${invite.workspace_name} declined` });
            setTimeout(() => setMessage(null), 2000);
        } catch (err) {
            console.error('Failed to decline invite:', err);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin text-teal-600" size={24} />
                </div>
            </div>
        );
    }

    if (invites.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-6 py-4">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-100 p-2 rounded-lg">
                        <Mail className="text-amber-600" size={18} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-amber-800">Pending Invitations</h3>
                        <p className="text-sm text-amber-700">
                            You have {invites.length} pending workspace invitation{invites.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Message Alert */}
            {message && (
                <div className={`px-6 py-3 text-sm ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border-b border-green-200' :
                    message.type === 'error' ? 'bg-red-50 text-red-700 border-b border-red-200' :
                    'bg-blue-50 text-blue-700 border-b border-blue-200'
                }`}>
                    {message.text}
                </div>
            )}
            
            {/* Invites List */}
            <div className="divide-y divide-gray-100">
                {invites.map(invite => (
                    <div key={invite.id} className="px-6 py-4 hover:bg-gray-50 transition-all duration-200">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                                    <Users className="text-teal-600" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900">{invite.workspace_name}</h4>
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                                        </span>
                                        <span>
                                            Invited {new Date(invite.invited_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => acceptInvite(invite)}
                                    disabled={acceptingId === invite.id}
                                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    {acceptingId === invite.id ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            Accepting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={14} />
                                            Accept
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => declineInvite(invite)}
                                    className="border border-gray-300 hover:border-red-300 text-gray-600 hover:text-red-600 px-5 py-2 rounded-lg text-sm font-medium transition-all"
                                >
                                    Decline
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PendingInvites;