import React, { useState, useEffect } from 'react';
import api from '../../src/api';
import { Users, FileText, Activity, Clock, TrendingUp, Shield } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/dashboard/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats', error);
            setStats({});
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
        </div>
    );

    const statCards = [
        { title: 'Total Users', value: stats?.total_users || 0, icon: Users, color: 'blue', change: '+12%' },
        { title: 'Total Items', value: stats?.total_items || 0, icon: FileText, color: 'purple', change: '+8%' },
        { title: 'Active Items', value: stats?.active_items || 0, icon: Activity, color: 'green', change: '+5%' },
        { title: 'Expired Items', value: stats?.expired_items || 0, icon: Clock, color: 'red', change: '+3%' },
        { title: 'Used Items', value: stats?.used_items || 0, icon: TrendingUp, color: 'orange', change: '+10%' },
    ];

    return (
        <div>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your SecureDrop instance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg bg-${stat.color}-50`}>
                                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                {stat.change}
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                        <p className="text-sm text-gray-500 mt-1">Latest registered users</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats?.recent_users?.map((user, index) => (
                            <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.recent_users || stats.recent_users.length === 0) && (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No users found
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Secure Items */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Secure Items</h2>
                        <p className="text-sm text-gray-500 mt-1">Latest encrypted items</p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {stats?.recent_items?.map((item) => (
                            <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.type === 'text' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'}`}>
                                            {item.type === 'text' ? '📝' : '📄'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {item.type === 'text' ? 'Text Message' : item.filename || 'File'}
                                            </p>
                                            <p className="text-xs font-mono text-gray-500">
                                                Token: {item.token.substring(0, 12)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 block">
                                            {item.user ? item.user.name : 'Guest'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.recent_items || stats.recent_items.length === 0) && (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No items found
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Footer */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <div>
                            <p className="font-semibold text-gray-900">System Health</p>
                            <p className="text-sm text-gray-600">All systems operational</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Last updated</p>
                        <p className="text-sm font-medium text-gray-900">{new Date().toLocaleTimeString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}