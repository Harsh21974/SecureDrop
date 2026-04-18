// RSA Key Generation and Encryption/Decryption using Web Crypto API

// Convert ArrayBuffer to Base64
function bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

// Convert Base64 to ArrayBuffer
function base64ToBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

// Convert PEM public key to CryptoKey
async function importPublicKey(pemKey) {
    // Remove PEM headers and whitespace
    const pemContents = pemKey
        .replace('-----BEGIN PUBLIC KEY-----', '')
        .replace('-----END PUBLIC KEY-----', '')
        .replace(/\s/g, '');
    
    const binaryDer = base64ToBuffer(pemContents);
    
    return await crypto.subtle.importKey(
        'spki',
        binaryDer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        true,
        ['encrypt']
    );
}

// Convert PEM private key to CryptoKey
async function importPrivateKey(pemKey) {
    const pemContents = pemKey
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
    
    const binaryDer = base64ToBuffer(pemContents);
    
    return await crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
            name: 'RSA-OAEP',
            hash: 'SHA-256',
        },
        true,
        ['decrypt']
    );
}

// Generate RSA key pair (2048-bit)
export async function generateKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: 'RSA-OAEP',
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
    );
    
    // Export keys to PEM format
    const publicKeyExported = await crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyExported = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
    
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${bufferToBase64(publicKeyExported)}\n-----END PUBLIC KEY-----`;
    const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${bufferToBase64(privateKeyExported)}\n-----END PRIVATE KEY-----`;
    
    return {
        publicKey: publicKeyPem,
        privateKey: privateKeyPem,
        cryptoKeyPair: keyPair,
    };
}

// Encrypt data with recipient's public key (RSA-OAEP)
export async function encryptWithPublicKey(dataBuffer, publicKeyPem) {
    const publicKey = await importPublicKey(publicKeyPem);
    
    // RSA can only encrypt data up to 190 bytes for 2048-bit key
    // For larger data, we use hybrid encryption: AES key encrypted with RSA
    if (dataBuffer.byteLength > 190) {
        // Generate random AES key
        const aesKey = await crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
        
        // Export AES key
        const aesKeyRaw = await crypto.subtle.exportKey('raw', aesKey);
        
        // Encrypt AES key with RSA
        const encryptedAesKey = await crypto.subtle.encrypt(
            { name: 'RSA-OAEP' },
            publicKey,
            aesKeyRaw
        );
        
        // Generate IV for AES
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        // Encrypt data with AES
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            aesKey,
            dataBuffer
        );
        
        // Combine: encryptedAesKey length (4 bytes) + encryptedAesKey + iv + encryptedData
        const encryptedAesKeyBytes = new Uint8Array(encryptedAesKey);
        const encryptedDataBytes = new Uint8Array(encryptedData);
        
        const result = new Uint8Array(4 + encryptedAesKeyBytes.length + iv.length + encryptedDataBytes.length);
        
        // Store length of encrypted AES key
        new DataView(result.buffer).setUint32(0, encryptedAesKeyBytes.length, false);
        result.set(encryptedAesKeyBytes, 4);
        result.set(iv, 4 + encryptedAesKeyBytes.length);
        result.set(encryptedDataBytes, 4 + encryptedAesKeyBytes.length + iv.length);
        
        return {
            encrypted: bufferToBase64(result),
            isHybrid: true,
        };
    }
    
    // Small data - encrypt directly with RSA
    const encrypted = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        publicKey,
        dataBuffer
    );
    
    return {
        encrypted: bufferToBase64(encrypted),
        isHybrid: false,
    };
}

// Decrypt data with private key
export async function decryptWithPrivateKey(encryptedBase64, privateKeyPem, isHybrid = false) {
    const privateKey = await importPrivateKey(privateKeyPem);
    const encryptedBuffer = base64ToBuffer(encryptedBase64);
    
    if (isHybrid) {
        const encryptedBytes = new Uint8Array(encryptedBuffer);
        
        // Read encrypted AES key length
        const aesKeyLength = new DataView(encryptedBytes.buffer).getUint32(0, false);
        
        // Extract components
        const encryptedAesKey = encryptedBytes.slice(4, 4 + aesKeyLength);
        const iv = encryptedBytes.slice(4 + aesKeyLength, 4 + aesKeyLength + 12);
        const encryptedData = encryptedBytes.slice(4 + aesKeyLength + 12);
        
        // Decrypt AES key with RSA
        const aesKeyRaw = await crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            privateKey,
            encryptedAesKey
        );
        
        // Import AES key
        const aesKey = await crypto.subtle.importKey(
            'raw',
            aesKeyRaw,
            { name: 'AES-GCM', length: 256 },
            false,
            ['decrypt']
        );
        
        // Decrypt data with AES
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            aesKey,
            encryptedData
        );
        
        return decrypted;
    }
    
    // Direct RSA decryption
    const decrypted = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        privateKey,
        encryptedBuffer
    );
    
    return decrypted;
}

// Encrypt private key with user's password (for storage on server)
export async function encryptPrivateKeyWithPassword(privateKeyPem, password) {
    // Use PBKDF2 to derive key from password
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 150000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
    );
    
    const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(privateKeyPem)
    );
    
    // Combine salt + iv + encrypted
    const encryptedBytes = new Uint8Array(encrypted);
    const result = new Uint8Array(salt.length + iv.length + encryptedBytes.length);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(encryptedBytes, salt.length + iv.length);
    
    return bufferToBase64(result);
}

// Decrypt private key with user's password
export async function decryptPrivateKeyWithPassword(encryptedBase64, password) {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const encryptedBuffer = base64ToBuffer(encryptedBase64);
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    
    const salt = encryptedBytes.slice(0, 16);
    const iv = encryptedBytes.slice(16, 28);
    const encryptedData = encryptedBytes.slice(28);
    
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations: 150000,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
    
    const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
    );
    
    return decoder.decode(decrypted);
}

// Export keys to file for backup (multi-device support)
export async function exportKeysToFile(privateKeyPem, publicKeyPem, password) {
    const encryptedPrivateKey = await encryptPrivateKeyWithPassword(privateKeyPem, password);
    const exportData = {
        version: '1',
        publicKey: publicKeyPem,
        encryptedPrivateKey: encryptedPrivateKey,
        exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `securedrop_keys_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import keys from backup file
export async function importKeysFromFile(file, password) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const privateKeyPem = await decryptPrivateKeyWithPassword(data.encryptedPrivateKey, password);
                resolve({
                    publicKey: data.publicKey,
                    privateKey: privateKeyPem,
                });
            } catch (err) {
                reject(new Error('Invalid password or corrupted key file'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}
// Generate random AES-256 key
export async function generateAESKey() {
    return await crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256,
        },
        true,
        ['encrypt', 'decrypt']
    );
}

// Encrypt data with AES key
export async function encryptWithAES(dataBuffer, aesKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encrypted = await crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        aesKey,
        dataBuffer
    );
    
    const encryptedBytes = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedBytes.length);
    result.set(iv, 0);
    result.set(encryptedBytes, iv.length);
    
    return bufferToBase64(result);
}

// Decrypt data with AES key
export async function decryptWithAES(encryptedDataBase64, aesKey) {
    const encryptedBuffer = base64ToBuffer(encryptedDataBase64);
    const encryptedBytes = new Uint8Array(encryptedBuffer);
    
    const iv = encryptedBytes.slice(0, 12);
    const data = encryptedBytes.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
        {
            name: 'AES-GCM',
            iv: iv,
        },
        aesKey,
        data
    );
    
    return decrypted;
}

// Encrypt AES key for a single recipient
export async function encryptAESKeyForRecipient(aesKey, recipientPublicKeyPem) {
    const recipientPublicKey = await importPublicKey(recipientPublicKeyPem);
    const aesKeyRaw = await crypto.subtle.exportKey('raw', aesKey);
    
    const encryptedAESKey = await crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        recipientPublicKey,
        aesKeyRaw
    );
    
    return bufferToBase64(encryptedAESKey);
}

// Decrypt AES key with user's private key
export async function decryptAESKeyForRecipient(encryptedAESKeyBase64, userPrivateKeyPem) {
    const userPrivateKey = await importPrivateKey(userPrivateKeyPem);
    const encryptedAESKey = base64ToBuffer(encryptedAESKeyBase64);
    
    const aesKeyRaw = await crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        userPrivateKey,
        encryptedAESKey
    );
    
    const aesKey = await crypto.subtle.importKey(
        'raw',
        aesKeyRaw,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );
    
    return aesKey;
}

// Multi-recipient encryption
export async function encryptForMultipleRecipients(dataBuffer, recipientsWithPublicKeys) {
    // Generate random AES key
    const aesKey = await generateAESKey();
    
    // Encrypt data with AES
    const encryptedData = await encryptWithAES(dataBuffer, aesKey);
    
    // Encrypt AES key for each recipient
    const encryptedKeys = [];
    for (const recipient of recipientsWithPublicKeys) {
        const encryptedKey = await encryptAESKeyForRecipient(aesKey, recipient.publicKey);
        encryptedKeys.push({
            user_id: recipient.user_id,
            email: recipient.email,
            encrypted_key: encryptedKey,
        });
    }
    
    return {
        encryptedData: encryptedData,
        encryptedKeys: encryptedKeys,
    };
}