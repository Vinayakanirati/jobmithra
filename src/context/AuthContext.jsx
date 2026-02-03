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

    // Check session validity and refresh data on mount
    useEffect(() => {
        const checkSession = async () => {
            const savedUser = localStorage.getItem('jobmithra_user');
            if (savedUser) {
                try {
                    const parsedUser = JSON.parse(savedUser);
                    if (parsedUser.email) {
                        const res = await fetch('/api/me', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email: parsedUser.email })
                        });
                        if (res.ok) {
                            const params = await res.json();
                            setUser(prev => ({ ...prev, ...params }));
                        }
                    }
                } catch (err) {
                    console.error("Session sync failed:", err);
                }
            }
        };
        checkSession();
    }, []);

    const login = async (userData) => {
        setError(null);
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) {
                if (response.status === 401 && data.isUnverified) {
                    return { success: false, isUnverified: true, message: data.message };
                }
                throw new Error(data.message || 'Login failed');
            }

            setUser(data);
            return { success: true };
        } catch (err) {
            console.error(err);
            setError(err.message);
            return { success: false, message: err.message };
        }
    };

    const registerInit = async (userData) => {
        setError(null);
        try {
            const response = await fetch('/api/register-init', {
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
            const response = await fetch('/api/register-verify', {
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

    const resendOTP = async (email) => {
        setError(null);
        try {
            const response = await fetch('/api/resend-verification-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const updateApplicationStatus = async (applicationId, status) => {
        setError(null);
        try {
            const response = await fetch('/api/update-application-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, applicationId, status })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Update failed');

            if (data.user) setUser(data.user);
            return true;
        } catch (err) {
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
        <AuthContext.Provider value={{
            user,
            login,
            registerInit,
            registerVerify,
            resendOTP,
            logout,
            updateUser,
            updateApplicationStatus,
            isAuthenticated: !!user,
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
