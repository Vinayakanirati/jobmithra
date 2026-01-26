import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';

const Register = ({ onSuccess, onSwitchToLogin }) => {
    const { registerInit, registerVerify, error: authError } = useAuth();
    const [step, setStep] = useState('register'); // 'register' or 'verify'
    const [otp, setOtp] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        mobile: '',
        address: '',
        skills: '',
        education: [{ institution: '', degree: '', year: '' }]
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Name is required.';
        if (!formData.email) newErrors.email = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid.';

        if (!formData.password) newErrors.password = 'Password is required.';
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';

        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index][field] = value;
        setFormData({ ...formData, education: newEducation });
    };

    const addEducation = () => {
        if (formData.education.length < 4) {
            setFormData({ ...formData, education: [...formData.education, { institution: '', degree: '', year: '' }] });
        }
    };

    const removeEducation = (index) => {
        const newEducation = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEducation });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validate()) {
            setIsLoading(true);
            const success = await registerInit({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                mobile: formData.mobile,
                address: formData.address,
                skills: formData.skills.split(',').map(s => s.trim()).slice(0, 10),
                education: formData.education
            });
            setIsLoading(false);
            if (success) {
                setStep('verify');
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) {
            setErrors({ otp: 'Please enter a 6-digit OTP.' });
            return;
        }
        setIsLoading(true);
        const success = await registerVerify(formData.email, otp);
        setIsLoading(false);
        if (success) {
            onSuccess();
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '5vh' }}>
            <GravityCard delay={0.1} style={{ textAlign: 'center' }}>
                <h2 style={{ fontFamily: 'Outfit', color: 'white', marginBottom: '2rem' }}>
                    {step === 'register' ? 'Create Account' : 'Verify Email'}
                </h2>

                {authError && <div style={{ color: '#ff4444', marginBottom: '1rem', background: 'rgba(255, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px' }}>{authError}</div>}

                {step === 'register' ? (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Full Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', border: errors.name ? '1px solid #ff4444' : '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                    placeholder="John Doe"
                                />
                                {errors.name && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>{errors.name}</span>}
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Mobile Number</label>
                                <input
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                    placeholder="+1 234 567 8900"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', border: errors.email ? '1px solid #ff4444' : '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                placeholder="john@example.com"
                            />
                            {errors.email && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>{errors.email}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Address</label>
                            <textarea
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', resize: 'vertical' }}
                                placeholder="123 Street, City, Country"
                                rows="2"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Skills (Comma separated, Max 10)</label>
                            <input
                                type="text"
                                value={formData.skills}
                                onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                placeholder="React, Node.js, Python..."
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Education (Max 4)</label>
                            {formData.education.map((edu, index) => (
                                <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <input
                                        placeholder="Institution"
                                        value={edu.institution}
                                        onChange={e => handleEducationChange(index, 'institution', e.target.value)}
                                        style={{ padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', outline: 'none' }}
                                    />
                                    <input
                                        placeholder="Degree"
                                        value={edu.degree}
                                        onChange={e => handleEducationChange(index, 'degree', e.target.value)}
                                        style={{ padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', outline: 'none' }}
                                    />
                                    <input
                                        placeholder="Year"
                                        value={edu.year}
                                        onChange={e => handleEducationChange(index, 'year', e.target.value)}
                                        style={{ padding: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white', outline: 'none' }}
                                    />
                                    {formData.education.length > 1 && (
                                        <button type="button" onClick={() => removeEducation(index)} style={{ background: '#ff4444', border: 'none', color: 'white', borderRadius: '4px', width: '30px', cursor: 'pointer' }}>×</button>
                                    )}
                                </div>
                            ))}
                            {formData.education.length < 4 && (
                                <button type="button" onClick={addEducation} style={{ background: 'transparent', border: '1px dashed var(--accent-blue)', color: 'var(--accent-blue)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>+ Add Education</button>
                            )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Password *</label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', border: errors.password ? '1px solid #ff4444' : '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                                {errors.password && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>{errors.password}</span>}
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Confirm Password *</label>
                                <input
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', border: errors.confirmPassword ? '1px solid #ff4444' : '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                                {errors.confirmPassword && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>{errors.confirmPassword}</span>}
                            </div>
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
                            {isLoading ? 'Sending OTP...' : 'Register'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', textAlign: 'left' }}>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>We've sent a 6-digit verification code to <strong>{formData.email}</strong>.</p>
                        <div>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Enter OTP</label>
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                style={{ width: '100%', padding: '1rem', background: 'var(--glass-bg)', border: errors.otp ? '1px solid #ff4444' : '1px solid var(--glass-border)', borderRadius: '8px', color: 'white', outline: 'none', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }}
                                placeholder="000000"
                            />
                            {errors.otp && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block' }}>{errors.otp}</span>}
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
                        }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Complete'}
                        </button>

                        <button type="button" onClick={() => setStep('register')} style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', textAlign: 'center' }}>
                            Go Back
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Already have an account?
                    <span
                        onClick={onSwitchToLogin}
                        style={{ color: 'var(--accent-blue)', cursor: 'pointer', marginLeft: '0.5rem', textDecoration: 'underline' }}
                    >
                        Login
                    </span>
                </p>
            </GravityCard>
        </div>
    );
};

export default Register;
