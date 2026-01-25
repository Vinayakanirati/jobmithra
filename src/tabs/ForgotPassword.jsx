import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';

const ForgotPassword = ({ onBackToLogin }) => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await fetch('http://localhost:5000/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                setStep(2);
            } else {
                setError(data.message || 'Error sending OTP');
            }
        } catch (err) {
            setError('Server error');
        }
        setIsLoading(false);
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');
        try {
            const res = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                setTimeout(() => onBackToLogin(), 2000);
            } else {
                setError(data.message || 'Error resetting password');
            }
        } catch (err) {
            setError('Server error');
        }
        setIsLoading(false);
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '10vh' }}>
            <GravityCard delay={0.1} style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit', color: 'white', marginBottom: '2rem' }}>
                    {step === 1 ? 'Forgot Password' : 'Reset Password'}
                </h2>

                {error && <div style={{ color: '#ff4444', marginBottom: '1rem', background: 'rgba(255, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</div>}
                {message && <div style={{ color: 'var(--accent-blue)', marginBottom: '1rem', background: 'rgba(0, 243, 255, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{message}</div>}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
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
                            {isLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>6-Digit OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={e => setOtp(e.target.value)}
                                required
                                maxLength="6"
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    background: 'var(--glass-bg)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none'
                                }}
                            />
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
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Remember password?
                    <span
                        onClick={onBackToLogin}
                        style={{ color: 'var(--accent-blue)', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}
                    >
                        Login
                    </span>
                </p>
            </GravityCard>
        </div>
    );
};

export default ForgotPassword;
