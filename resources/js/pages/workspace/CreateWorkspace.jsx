import React, { useState } from "react";
import api from "../../../src/api";
import { Plus } from "lucide-react";

const CreateWorkspace = ({ onCreated }) => {
    const [name, setName] = useState("");

    const handleCreate = async () => {
        if (!name.trim()) return;

        try {
            await api.post("/workspaces", { name });
            setName("");
            if (onCreated) onCreated();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Create Workspace
            </h3>

            <div className="flex gap-3">
                <input
                    type="text"
                    placeholder="Enter workspace name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <button
                    onClick={handleCreate}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition"
                >
                    <Plus size={16} />
                    Create
                </button>
            </div>
        </div>
    );
};

export default CreateWorkspace;