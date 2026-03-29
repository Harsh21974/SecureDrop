import React, { useState, useEffect } from 'react';
import api from '../../src/api';

export default function SecureItems() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchItems();
    }, [search, typeFilter, statusFilter]);

    const fetchItems = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/secure-items', {
                params: { search, type: typeFilter, status: statusFilter }
            });
            setItems(response.data.data);
        } catch (error) {
            console.error('Failed to fetch items', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this secure item? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/secure-items/${id}`);
            await fetchItems();
        } catch (error) {
            alert('Failed to delete item');
        }
    };

    const handleRevoke = async (id) => {
        if (!confirm('Revoke this link? It will expire immediately.')) return;
        try {
            await api.patch(`/admin/secure-items/${id}/revoke`);
            await fetchItems();
        } catch (error) {
            alert('Failed to revoke item');
        }
    };

    if (loading) return <div>Loading secure items...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Secure Items</h1>
            <div className="mb-4 flex gap-2 flex-wrap">
                <input
                    type="text"
                    placeholder="Search by token or filename"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 flex-1"
                />
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border rounded px-3 py-2">
                    <option value="">All types</option>
                    <option value="text">Text</option>
                    <option value="file">File</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
                    <option value="">All status</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="used">Used up</option>
                </select>
                <button onClick={fetchItems} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Token</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Filename</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {items.map(item => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 text-sm font-mono">{item.token.substring(0, 12)}...</td>
                                <td className="px-6 py-4 text-sm capitalize">{item.type}</td>
                                <td className="px-6 py-4 text-sm">{item.filename || '-'}</td>
                                <td className="px-6 py-4 text-sm">{item.user ? item.user.name : 'Guest'}</td>
                                <td className="px-6 py-4 text-sm">{new Date(item.created_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm">{new Date(item.expires_at).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-sm">{item.view_count}/{item.max_views}</td>
                                <td className="px-6 py-4 text-sm space-x-2">
                                    <button onClick={() => handleRevoke(item.id)} className="text-yellow-600 hover:text-yellow-800">Revoke</button>
                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}