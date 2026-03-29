const encoder = new TextEncoder();
const decoder = new TextDecoder();

const ITERATION = 150000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12;

function generateRandomBytes(length) {
        return crypto.getRandomValues(new Uint8Array(length));
}

function bufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
}

function base64ToBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
}

async function deriveKey(password, salt) {
        const keyMaterial = await crypto.subtle.importKey(
                "raw",
                encoder.encode(password),
                "PBKDF2",
                false,
                ["deriveKey"]
        );

        return crypto.subtle.deriveKey(
                {
                        "name": "PBKDF2",
                        salt,
                        iterations: ITERATION,
                        hash: "SHA-256",
                },
                keyMaterial,
                {
                        name: "AES-GCM",
                        length: 256
                },
                false,
                ["encrypt", "decrypt"]
        );
}

export async function encryptData(dataBuffer, password) {
        const salt = generateRandomBytes(SALT_LENGTH);
        const iv = generateRandomBytes(IV_LENGTH);

        const key = await deriveKey(password, salt);

        const encrypted = await crypto.subtle.encrypt(
                {
                        name: "AES-GCM",
                        iv,
                },
                key,
                dataBuffer
        );

        const combined = new Uint8Array(
                salt.length + iv.length + encrypted.byteLength
        );
        combined.set(salt, 0);
        combined.set(iv, salt.length);
        combined.set(new Uint8Array(encrypted), salt.length + iv.length);

        return bufferToBase64(combined);
}

export async function decryptData(base64Data, password) {
        const combinedBuffer = base64ToBuffer(base64Data);
        const combined = new Uint8Array(combinedBuffer);

        const salt = combined.slice(0, SALT_LENGTH);
        const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH);

        const key = await deriveKey(password, salt);

        const decrypted = await crypto.subtle.decrypt(
                {
                        name: "AES-GCM",
                        iv,
                },
                key,
                ciphertext
        );
        return decrypted;
}