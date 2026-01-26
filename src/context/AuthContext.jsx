import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('jobmithra_user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            localStorage.setItem('jobmithra_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('jobmithra_user');
        }
    }, [user]);

    const login = async (userData) => {
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/login', {
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

    const registerInit = async (userData) => {
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/register-init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Registration failed');

            return true;
        } catch (err) {
            console.error(err);
            setError(err.message);
            return false;
        }
    };

    const registerVerify = async (email, otp) => {
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/register-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Verification failed');

            setUser(data);
            return true;
        } catch (err) {
            console.error(err);
            setError(err.message);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('jobmithra_user');
    };

    const updateUser = (updatedData) => {
        setUser(prev => {
            const newUser = { ...prev, ...updatedData };
            localStorage.setItem('jobmithra_user', JSON.stringify(newUser));
            return newUser;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, registerInit, registerVerify, logout, updateUser, isAuthenticated: !!user, error }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
