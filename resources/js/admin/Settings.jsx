import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Globe, Shield, Users, Mail, RefreshCw, CheckCircle } from 'lucide-react';

export default function Settings() {
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    
    // Simple settings state
    const [settings, setSettings] = useState({
        // General
        siteName: 'SecureDrop',
        siteEmail: 'admin@securedrop.com',
        maintenanceMode: false,
        
        // Security
        maxFileSize: 100,
        maxLoginAttempts: 5,
        
        // User
        allowRegistration: true,
        defaultUserRole: 'user',
        
        // Notifications
        emailNotifications: true,
        adminEmail: 'admin@securedrop.com',
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            // Load from localStorage or API
            const savedSettings = localStorage.getItem('admin_settings');
            if (savedSettings) {
                setSettings(JSON.parse(savedSettings));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save to localStorage
            localStorage.setItem('admin_settings', JSON.stringify(settings));
            
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="animate-spin text-red-600" size={32} />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <SettingsIcon size={28} className="text-red-600" />
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    </div>
                    <p className="text-gray-600">Manage your SecureDrop configuration</p>
                </div>

                {/* Settings Form */}
                <div className="space-y-6">
                    {/* General Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Globe size={18} className="text-red-600" />
                                <h2 className="font-semibold text-gray-900">General Settings</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Site Name
                                </label>
                                <input
                                    type="text"
                                    value={settings.siteName}
                                    onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.siteEmail}
                                    onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                                    <p className="text-sm text-gray-500">Only admins can access the site</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.maintenanceMode}
                                        onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Security Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Shield size={18} className="text-red-600" />
                                <h2 className="font-semibold text-gray-900">Security Settings</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max File Size (MB)
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxFileSize}
                                    onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
                                    min="1"
                                    max="500"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Login Attempts
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxLoginAttempts}
                                    onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                                    min="3"
                                    max="10"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* User Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Users size={18} className="text-red-600" />
                                <h2 className="font-semibold text-gray-900">User Settings</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Allow New Registrations</h3>
                                    <p className="text-sm text-gray-500">Enable/disable user signups</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.allowRegistration}
                                        onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Default User Role
                                </label>
                                <select
                                    value={settings.defaultUserRole}
                                    onChange={(e) => setSettings({...settings, defaultUserRole: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="user">User</option>
                                    <option value="premium">Premium User</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <div className="flex items-center gap-2">
                                <Mail size={18} className="text-red-600" />
                                <h2 className="font-semibold text-gray-900">Notification Settings</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Email Notifications</h3>
                                    <p className="text-sm text-gray-500">Send system emails to users</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={settings.emailNotifications}
                                        onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                </label>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Admin Notification Email
                                </label>
                                <input
                                    type="email"
                                    value={settings.adminEmail}
                                    onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-3">
                        {saveSuccess && (
                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                                <CheckCircle size={18} />
                                <span className="text-sm">Settings saved!</span>
                            </div>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <RefreshCw size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}