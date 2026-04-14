import React, { useEffect, useState } from "react";
import api from "../../../src/api";
import { Plus, Users, Crown, Mail, X, Trash2, UserMinus, Check, AlertCircle, Send } from "lucide-react";

const WorkspaceDashboard = () => {
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [expandedWorkspace, setExpandedWorkspace] = useState(null);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteStatus, setInviteStatus] = useState({});
    const [sendingInvite, setSendingInvite] = useState(false);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const res = await api.get("/workspaces");
            setWorkspaces(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const createWorkspace = async () => {
        if (!newWorkspaceName.trim()) return;
        try {
            await api.post("/workspaces", { name: newWorkspaceName });
            setShowCreateModal(false);
            setNewWorkspaceName("");
            fetchWorkspaces();
        } catch (err) {
            console.error(err);
        }
    };

    const sendInvite = async (workspaceId) => {
        if (!inviteEmail.trim()) {
            setInviteStatus({ [workspaceId]: { type: "error", message: "Email required" } });
            setTimeout(() => setInviteStatus({}), 3000);
            return;
        }

        setSendingInvite(true);
        
        try {
            await api.post("/workspace/invite", {
                workspace_id: workspaceId,
                email: inviteEmail
            });
            setInviteStatus({ [workspaceId]: { type: "success", message: "Invitation sent!" } });
            setInviteEmail("");
            setTimeout(() => {
                setInviteStatus({});
                setExpandedWorkspace(null);
            }, 2000);
        } catch (err) {
            setInviteStatus({ 
                [workspaceId]: { 
                    type: "error", 
                    message: err.response?.data?.message || "Failed to send invite" 
                } 
            });
            setTimeout(() => setInviteStatus({}), 3000);
        } finally {
            setSendingInvite(false);
        }
    };

    const deleteWorkspace = async (workspaceId) => {
        if (!confirm("Delete this workspace permanently?")) return;
        try {
            await api.delete(`/workspaces/${workspaceId}`);
            fetchWorkspaces();
        } catch (err) {
            console.error(err);
        }
    };

    const removeMember = async (workspaceId, memberId) => {
        if (!confirm("Remove this member?")) return;
        try {
            await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
            fetchWorkspaces();
        } catch (err) {
            console.error(err);
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'owner':
                return <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full"><Crown size={12} /> Owner</span>;
            case 'admin':
                return <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>;
            default:
                return <span className="inline-flex text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Member</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Workspaces</h1>
                            <p className="text-gray-500 text-sm mt-0.5">Manage your team and secure collaboration</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm hover:shadow"
                        >
                            <Plus size={18} />
                            New Workspace
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading workspaces...</div>
                ) : workspaces.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <Users className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workspaces Yet</h3>
                        <p className="text-gray-500 mb-4">Create your first workspace to start collaborating</p>
                        <button onClick={() => setShowCreateModal(true)} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl">
                            Create Workspace
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {workspaces.map(workspace => {
                            const isOwner = workspace.user_role === 'owner';
                            const isAdmin = workspace.user_role === 'admin';
                            const canInvite = isOwner || isAdmin;
                            const isExpanded = expandedWorkspace === workspace.id;
                            const status = inviteStatus[workspace.id];
                            
                            return (
                                <div key={workspace.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition hover:shadow-md">
                                    {/* Workspace Header */}
                                    <div className="px-6 py-4 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
                                                <Users className="text-teal-600" size={22} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-lg">{workspace.name}</h3>
                                                <p className="text-xs text-gray-500">
                                                    {workspace.members?.length || 0} member{workspace.members?.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Invite Button - Smooth expand/collapse */}
                                            {canInvite && (
                                                <button
                                                    onClick={() => setExpandedWorkspace(isExpanded ? null : workspace.id)}
                                                    className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition ${
                                                        isExpanded 
                                                            ? 'bg-gray-100 text-gray-600' 
                                                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                                                    }`}
                                                >
                                                    {isExpanded ? (
                                                        <>Cancel</>
                                                    ) : (
                                                        <>
                                                            <Mail size={14} />
                                                            Invite Member
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            {isOwner && (
                                                <button
                                                    onClick={() => deleteWorkspace(workspace.id)}
                                                    className="text-gray-400 hover:text-red-600 transition p-2 rounded-lg hover:bg-red-50"
                                                    title="Delete Workspace"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Expandable Invite Panel */}
                                    {isExpanded && canInvite && (
                                        <div className="border-t border-teal-100 bg-teal-50/30 px-6 py-4 animate-slideDown">
                                            <div className="max-w-md">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Invite by email
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="email"
                                                        placeholder="colleague@company.com"
                                                        value={inviteEmail}
                                                        onChange={(e) => setInviteEmail(e.target.value)}
                                                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                                        onKeyPress={(e) => e.key === 'Enter' && sendInvite(workspace.id)}
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => sendInvite(workspace.id)}
                                                        disabled={sendingInvite}
                                                        className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition disabled:opacity-50"
                                                    >
                                                        <Send size={16} />
                                                        Send
                                                    </button>
                                                </div>
                                                
                                                {/* Status Message */}
                                                {status && (
                                                    <div className={`mt-3 flex items-center gap-2 text-sm p-2 rounded-lg ${
                                                        status.type === 'success' 
                                                            ? 'text-green-700 bg-green-50' 
                                                            : 'text-red-700 bg-red-50'
                                                    }`}>
                                                        {status.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                                                        {status.message}
                                                    </div>
                                                )}
                                                
                                                <p className="text-xs text-gray-500 mt-3">
                                                    An email invitation will be sent. They'll join as a member.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Members Section */}
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold text-gray-700">Team Members</h4>
                                            <span className="text-xs text-gray-400">{workspace.members?.length} total</span>
                                        </div>
                                        <div className="space-y-2">
                                            {workspace.members?.map(member => (
                                                <div key={member.id} className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-semibold text-teal-700">
                                                                {member.user?.name?.charAt(0)?.toUpperCase() || '?'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{member.user?.name}</p>
                                                            <p className="text-xs text-gray-500">{member.user?.email}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getRoleBadge(member.role)}
                                                        {isOwner && member.role !== 'owner' && (
                                                            <button
                                                                onClick={() => removeMember(workspace.id, member.id)}
                                                                className="text-gray-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50"
                                                                title="Remove Member"
                                                            >
                                                                <UserMinus size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Workspace Modal - Keep as modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl transform animate-scaleIn">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-gray-900">Create Workspace</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={20} />
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="e.g., Design Team, Marketing, Engineering"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                            autoFocus
                            onKeyPress={(e) => e.key === 'Enter' && createWorkspace()}
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button onClick={createWorkspace} className="flex-1 bg-teal-600 text-white rounded-xl py-2.5 hover:bg-teal-700 transition">
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceDashboard;