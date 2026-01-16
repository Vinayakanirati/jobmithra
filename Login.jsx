import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';

const Login = ({ onSuccess, onSwitchToRegister }) => {
    const { login, error: authError } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

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
        if (validate()) {
            setIsLoading(true);
            const success = await login(formData);
            setIsLoading(false);
            if (success) {
                onSuccess();
            }
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto', paddingTop: '10vh' }}>
            <GravityCard delay={0.1} style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit', color: 'white', marginBottom: '2rem' }}>Welcome Back</h2>

                {authError && <div style={{ color: '#ff4444', marginBottom: '1rem', background: 'rgba(255, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{authError}</div>}

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
                        <input
                            type="password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                background: 'var(--glass-bg)',
                                border: errors.password ? '1px solid #ff4444' : '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
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

                <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Don't have an account?
                    <span
                        onClick={onSwitchToRegister}
                        style={{ color: 'var(--accent-blue)', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}
                    >
                        Register
                    </span>
                </p>
            </GravityCard>
        </div>
    );
};

export default Login;
