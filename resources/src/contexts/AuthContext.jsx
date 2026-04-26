import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

   useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('Token found:', token ? 'Yes' : 'No'); // DEBUG
        
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUser();
        } else {
            console.log('No token found, setting loading false'); // DEBUG
            setLoading(false);
        }
    }, []);

    const fetchUser = async () => {
        try {
            console.log('Fetching user...'); // DEBUG
            const response = await api.get('/me');
            console.log('User fetched:', response.data); // DEBUG
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user:', error); // DEBUG
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        
        return response.data;
    };

    const register = async (name, email, password, passwordConfirmation, publicKey, encryptedPrivateKey) => {
        const response = await api.post('/register', {
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            public_key: publicKey,
            encrypted_private_key: encryptedPrivateKey,
        });
        
        const { token, user: userData } = response.data;
        
        localStorage.setItem('token', token);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        
        return response.data;
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('pending_invite_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};