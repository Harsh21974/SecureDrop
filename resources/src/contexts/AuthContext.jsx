import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const fetchUser = async () => {
        try {
            const response = await api.get('/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
            localStorage.removeItem('token');
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { token, user: userData } = response.data;
            
            localStorage.setItem('token', token);
            setToken(token);
            setUser(userData);
            
            return response.data; // Return the full response
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
        }
    };

    const value = {
        user,
        token,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};