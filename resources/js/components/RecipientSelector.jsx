import React, { useState, useEffect } from 'react';
import { Search, User, Mail, X } from 'lucide-react';
import api from '../../src/api';

const RecipientSelector = ({ onSelect, onClear, selectedRecipient }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm.length >= 2) {
                searchUsers();
            } else {
                setResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);

    const searchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/users/search?query=${encodeURIComponent(searchTerm)}`);
            setResults(response.data);
            setShowResults(true);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (user) => {
        onSelect(user);
        setSearchTerm('');
        setShowResults(false);
    };

    const handleClear = () => {
        onClear();
        if (onClear) onClear();
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient (Optional)
            </label>
            
            {selectedRecipient ? (
                <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <User size={16} className="text-teal-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">{selectedRecipient.name}</p>
                            <p className="text-xs text-gray-500">{selectedRecipient.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClear}
                        className="text-gray-400 hover:text-red-500 transition"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div className="relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by email or name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => results.length > 0 && setShowResults(true)}
                            className="w-full border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 rounded-xl py-3 pl-10 pr-4 transition"
                        />
                    </div>
                    
                    {showResults && (results.length > 0 || loading) && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">Searching...</div>
                            ) : (
                                results.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => handleSelect(user)}
                                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-center gap-3 border-b border-gray-100 last:border-0"
                                    >
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                            <User size={14} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <Mail size={10} /> {user.email}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
                {selectedRecipient 
                    ? "✓ Message will be encrypted with recipient's public key" 
                    : "Select a recipient for public-key encryption (no password needed)"}
            </p>
        </div>
    );
};

export default RecipientSelector;