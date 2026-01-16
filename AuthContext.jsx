import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    const login = async (userData) => {
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Login failed');

            setUser(data);
            return true;
        } catch (err) {
            console.error(err);
            setError(err.message);
            return false;
        }
    };

    const register = async (userData) => {
        setError(null);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            // setUser(data); // Don't auto-login
            return true;
        } catch (err) {
            console.error(err);
            setError(err.message);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
    };

    const updateUser = (updatedData) => {
        setUser(prev => ({ ...prev, ...updatedData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated: !!user, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
