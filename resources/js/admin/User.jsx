import React, { useState, useEffect } from 'react';
import api from '../../src/api';

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', email: '', role: '', is_premium: false });

    useEffect(() => {
        fetchUsers();
    }, [search]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users', { params: { search } });
            setUsers(response.data.data); // paginated, but we'll simplify
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setEditForm({
            name: user.name,
            email: user.email,
            role: user.role,
            is_premium: user.is_premium,
        });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/admin/users/${editingUser.id}`, editForm);
            await fetchUsers();
            setEditingUser(null);
        } catch (error) {
            alert('Failed to update user');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this user? This will also delete their secure items.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            await fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    if (loading) return <div>Loading users...</div>;

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Users</h1>
            <div className="mb-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Search by name or email"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 flex-1"
                />
                <button onClick={fetchUsers} className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
            </div>

            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Name</label>
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    className="w-full border rounded p-2"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Role</label>
                                <select
                                    value={editForm.role}
                                    onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                                    className="w-full border rounded p-2"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div className="mb-4 flex items-center">
                                <input
                                    type="checkbox"
                                    checked={editForm.is_premium}
                                    onChange={e => setEditForm({ ...editForm, is_premium: e.target.checked })}
                                    className="mr-2"
                                />
                                <label className="text-sm font-medium">Premium</label>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
                                <button type="button" onClick={() => setEditingUser(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Premium</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 text-sm">{user.id}</td>
                                <td className="px-6 py-4 text-sm">{user.name}</td>
                                <td className="px-6 py-4 text-sm">{user.email}</td>
                                <td className="px-6 py-4 text-sm">{user.role}</td>
                                <td className="px-6 py-4 text-sm">{user.is_premium ? 'Yes' : 'No'}</td>
                                <td className="px-6 py-4 text-sm space-x-2">
                                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800">Edit</button>
                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}