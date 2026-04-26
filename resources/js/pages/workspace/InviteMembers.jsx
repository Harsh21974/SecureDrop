import React, { useState } from "react";
import api from "../../../src/api";
import { Mail, Loader2 } from "lucide-react";

const InviteMembers = ({ workspaceId }) => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const sendInvite = async () => {
        if (!email.trim()) {
            setMessage({ type: "error", text: "Email is required" });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await api.post("/workspace/invite", {
                workspace_id: workspaceId,
                email
            });

            setEmail("");
            setMessage({ type: "success", text: "Invitation sent successfully" });

        } catch (err) {
            setMessage({
                type: "error",
                text: err.response?.data?.message || "Failed to send invite"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            <div className="flex gap-2">
                <input
                    type="email"
                    placeholder="Invite by email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500"
                />

                <button
                    onClick={sendInvite}
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                    Invite
                </button>
            </div>

            {/* Feedback Message */}
            {message && (
                <p className={`mt-2 text-sm ${
                    message.type === "success" ? "text-green-600" : "text-red-600"
                }`}>
                    {message.text}
                </p>
            )}
        </div>
    );
};

export default InviteMembers;