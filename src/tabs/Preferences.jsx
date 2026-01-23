import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';

const Preferences = () => {
    const [formData, setFormData] = useState({ role: '', location: '', experience: '' });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.role) newErrors.role = 'Desired Role is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.experience) newErrors.experience = 'Experience is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (validate()) {
            alert('Preferences saved!');
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Job Preferences</h2>

            <GravityCard delay={0.1}>
                <div className="animate-fall-in" style={{ animationDelay: '0.2s', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Desired Role</label>
                    <input
                        type="text"
                        placeholder="e.g. Senior Frontend Engineer"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        style={{
                            width: '100%',
                            background: 'var(--glass-bg)',
                            border: errors.role ? '1px solid #ff4444' : '1px solid var(--glass-border)',
                            padding: '1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontFamily: 'Inter',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                    />
                    {errors.role && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.role}</span>}
                </div>

                <div className="animate-fall-in" style={{ animationDelay: '0.25s', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Suggestions:</span>
                    {['Full Stack Developer', 'UI Engineer', 'Tech Lead'].map(role => (
                        <span key={role}
                            onClick={() => setFormData({ ...formData, role })}
                            style={{
                                fontSize: '0.8rem',
                                color: 'var(--accent-blue)',
                                cursor: 'pointer',
                                borderBottom: '1px dashed var(--accent-blue)'
                            }}>
                            {role}
                        </span>
                    ))}
                </div>

                <div className="animate-fall-in" style={{ animationDelay: '0.3s', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Preferred Location</label>
                    <input
                        type="text"
                        placeholder="e.g. Remote, San Francisco"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        style={{
                            width: '100%',
                            background: 'var(--glass-bg)',
                            border: errors.location ? '1px solid #ff4444' : '1px solid var(--glass-border)',
                            padding: '1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontFamily: 'Inter',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                    />
                    {errors.location && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.location}</span>}
                </div>

                <div className="animate-fall-in" style={{ animationDelay: '0.4s', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Years of Experience</label>
                    <input
                        type="text"
                        placeholder="e.g. 5+"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        style={{
                            width: '100%',
                            background: 'var(--glass-bg)',
                            border: errors.experience ? '1px solid #ff4444' : '1px solid var(--glass-border)',
                            padding: '1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontFamily: 'Inter',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                    />
                    {errors.experience && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.experience}</span>}
                </div>

                <button onClick={handleSave} style={{
                    width: '100%',
                    padding: '1rem',
                    marginTop: '1rem',
                    background: 'var(--accent-blue)',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 0 15px rgba(0, 243, 255, 0.3)'
                }} className="animate-fall-in">
                    Save Preferences
                </button>
            </GravityCard>
        </div>
    );
};

export default Preferences;
