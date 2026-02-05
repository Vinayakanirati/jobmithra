import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSuccess, onSwitchToRegister, onForgotPassword }) => {
    const { login, error: authError } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [serverMessage, setServerMessage] = useState('');

    const validate = () => {
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email required.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid.';

        if (!formData.password) newErrors.password = 'Password is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerMessage('');
        if (validate()) {
            setIsLoading(true);
            const result = await login(formData);
            setIsLoading(false);

            if (result && result.success) {
                onSuccess();
            } else if (result && result.isUnverified) {
                setIsVerifying(true);
                setServerMessage("Account not verified. Enter OTP sent to your email.");
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!otp) {
            setErrors({ ...errors, otp: 'OTP is required' });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/register-verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp })
            });
            const data = await res.json();

            if (res.ok) {
                // Verification successful, try logging in again automatically
                const loginResult = await login(formData);
                if (loginResult && loginResult.success) {
                    onSuccess();
                } else {
                    setServerMessage("Verification successful. Please login.");
                    setIsVerifying(false);
                }
            } else {
                setErrors({ ...errors, otp: data.message });
            }
        } catch (err) {
            setErrors({ ...errors, otp: 'Verification failed. Try again.' });
        }
        setIsLoading(false);
    };

    const handleResendOtp = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/resend-verification-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });
            const data = await res.json();
            setServerMessage(data.message || 'OTP Resent!');
        } catch (err) {
            setServerMessage('Failed to resend OTP.');
        }
        setIsLoading(false);
    }

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '10vh' }}>
            <GravityCard delay={0.1} style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit', color: 'white', marginBottom: '2rem' }}>
                    {isVerifying ? 'Verify Email' : 'Welcome Back'}
                </h2>

                {(authError || serverMessage) && (
                    <div style={{
                        color: (authError && !isVerifying) ? '#ff4444' : '#00ff88',
                        marginBottom: '1rem',
                        background: (authError && !isVerifying) ? 'rgba(255, 68, 68, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                        padding: '0.5rem',
                        borderRadius: '4px'
                    }}>
                        {authError || serverMessage}
                    </div>
                )}

                {!isVerifying ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--glass-bg)',
                                    border: errors.email ? '1px solid #ff4444' : '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                            {errors.email && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>{errors.email}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        paddingRight: '3rem',
                                        background: 'var(--glass-bg)',
                                        border: errors.password ? '1px solid #ff4444' : '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0'
                                    }}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {errors.password && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>{errors.password}</span>}
                        </div>

                        <button type="submit" disabled={isLoading} style={{
                            background: isLoading ? 'var(--text-secondary)' : 'var(--accent-blue)',
                            border: 'none',
                            padding: '1rem',
                            borderRadius: '8px',
                            fontWeight: '600',
                            cursor: isLoading ? 'wait' : 'pointer',
                            marginTop: '1rem',
                            boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)'
                        }}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Enter OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                placeholder="6-digit code"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--glass-bg)',
                                    border: errors.otp ? '1px solid #ff4444' : '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none',
                                    letterSpacing: '0.2rem',
                                    textAlign: 'center',
                                    fontSize: '1.2rem'
                                }}
                            />
                            {errors.otp && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>{errors.otp}</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="button" onClick={handleResendOtp} disabled={isLoading} style={{
                                flex: 1,
                                background: 'transparent',
                                border: '1px solid var(--accent-blue)',
                                color: 'var(--accent-blue)',
                                padding: '1rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: isLoading ? 'wait' : 'pointer',
                            }}>
                                Resend OTP
                            </button>
                            <button type="submit" disabled={isLoading} style={{
                                flex: 1,
                                background: 'var(--accent-blue)',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: isLoading ? 'wait' : 'pointer',
                                boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)'
                            }}>
                                Verify
                            </button>
                        </div>
                        <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer' }} onClick={() => setIsVerifying(false)}>
                            Back to Login
                        </p>
                    </form>
                )}

                {!isVerifying && (
                    <>
                        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            <span
                                onClick={onForgotPassword}
                                style={{ color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                Forgot Password?
                            </span>
                        </p>

                        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Don't have an account?
                            <span
                                onClick={onSwitchToRegister}
                                style={{ color: 'var(--accent-blue)', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}
                            >
                                Register
                            </span>
                        </p>
                    </>
                )}
            </GravityCard>
        </div>
    );
};

export default Login;
