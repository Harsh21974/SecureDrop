import React, { useState } from 'react';
import { useAuth } from '../../src/contexts/AuthContext';
import { exportKeysToFile, importKeysFromFile } from '../crypto/keys';
import { Download, Upload, Key, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../src/api';

export default function Security() {
    const { user } = useAuth();
    const [exportPassword, setExportPassword] = useState('');
    const [importPassword, setImportPassword] = useState('');
    const [importFile, setImportFile] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleExportKeys = async () => {
        if (!exportPassword) {
            setMessage({ type: 'error', text: 'Please enter a password to encrypt your backup' });
            return;
        }
        
        try {
            // Fetch encrypted private key from server
            const response = await api.get('/keys/my-private');
            const { decryptPrivateKeyWithPassword } = await import('../crypto/keys');
            
            // Decrypt private key with user's login password (prompt)
            const loginPassword = prompt('Enter your login password to export your keys:');
            if (!loginPassword) return;
            
            const privateKeyPem = await decryptPrivateKeyWithPassword(
                response.data.encrypted_private_key,
                loginPassword
            );
            
            // Get public key from user object
            const publicKeyPem = user.public_key;
            
            // Export to file
            await exportKeysToFile(privateKeyPem, publicKeyPem, exportPassword);
            setMessage({ type: 'success', text: 'Keys exported successfully!' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Export failed' });
        }
    };

    const handleImportKeys = async () => {
        if (!importFile) {
            setMessage({ type: 'error', text: 'Please select a backup file' });
            return;
        }
        if (!importPassword) {
            setMessage({ type: 'error', text: 'Please enter the backup password' });
            return;
        }
        
        setLoading(true);
        try {
            const { importKeysFromFile } = await import('../crypto/keys');
            const keys = await importKeysFromFile(importFile, importPassword);
            
            // Update keys on server
            await api.put('/keys', {
                public_key: keys.publicKey,
                encrypted_private_key: keys.encryptedPrivateKey,
            });
            
            setMessage({ type: 'success', text: 'Keys imported successfully! You can now use this device.' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.message || 'Import failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Security Settings</h1>
            <p className="text-gray-500 mb-8">Manage your encryption keys and security preferences</p>
            
            <div className="grid md:grid-cols-2 gap-6">
                {/* Export Keys Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-teal-100 p-2 rounded-lg">
                            <Download className="text-teal-600" size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Export Keys</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Export your encryption keys to use on another device. The backup will be encrypted with a password.
                    </p>
                    <div className="space-y-3">
                        <input
                            type="password"
                            placeholder="Backup encryption password"
                            value={exportPassword}
                            onChange={(e) => setExportPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2"
                        />
                        <button
                            onClick={handleExportKeys}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl transition"
                        >
                            Export Keys
                        </button>
                    </div>
                </div>
                
                {/* Import Keys Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-teal-100 p-2 rounded-lg">
                            <Upload className="text-teal-600" size={20} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-900">Import Keys</h2>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                        Import previously exported keys to use your account on this device.
                    </p>
                    <div className="space-y-3">
                        <input
                            type="file"
                            accept=".json"
                            onChange={(e) => setImportFile(e.target.files[0])}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm"
                        />
                        <input
                            type="password"
                            placeholder="Backup encryption password"
                            value={importPassword}
                            onChange={(e) => setImportPassword(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2"
                        />
                        <button
                            onClick={handleImportKeys}
                            disabled={loading}
                            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Importing...' : 'Import Keys'}
                        </button>
                    </div>
                </div>
            </div>
            
            {message && (
                <div className={`mt-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </div>
            )}
            
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Shield size={18} className="text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-amber-800">Important Security Information</p>
                        <p className="text-xs text-amber-700 mt-1">
                            Your encryption keys are unique to your account. If you lose your keys, you will lose access to all encrypted messages.
                            Always keep a secure backup of your keys. Never share your private key with anyone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}