import React, { useState, useEffect } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';

const Preferences = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        role: user?.preferredRole || '',
        location: user?.preferredLocation || '',
        experience: user?.preferredExperience || ''
    });

    const [lEmail, setLEmail] = useState(user?.linkedinEmail || '');
    const [lPassword, setLPassword] = useState(user?.linkedinEmail ? '••••••••' : '');
    const [isAutoApplying, setIsAutoApplying] = useState(false);
    const [showLinkedInPassword, setShowLinkedInPassword] = useState(false);
    const [errors, setErrors] = useState({});

    // Use rolesSuited from user data if available
    const roleSuggestions = user?.rolesSuited?.length > 0
        ? user.rolesSuited
        : ['Full Stack Developer', 'UI Engineer', 'Tech Lead'];

    const validate = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Full Name is required';
        if (!formData.role) newErrors.role = 'Desired Role is required';
        if (!formData.location) newErrors.location = 'Location is required';
        if (!formData.experience) newErrors.experience = 'Experience is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                role: user.preferredRole || '',
                location: user.preferredLocation || '',
                experience: user.preferredExperience || ''
            });
            setLEmail(user.linkedinEmail || '');
            if (user.linkedinEmail) {
                setLPassword('••••••••');
            }
        }
    }, [user]);

    const handleSavePreferences = async () => {
        if (!validate()) return;
        try {
            const res = await fetch('/api/save-preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    name: formData.name,
                    role: formData.role,
                    location: formData.location,
                    experience: formData.experience
                })
            });
            const data = await res.json();
            if (res.ok) {
                updateUser(data.user);
                alert(data.message);
            } else {
                alert(data.message || 'Error saving preferences');
            }
        } catch (err) {
            alert('Error saving preferences');
        }
    };

    const handleLinkedInSave = async () => {
        try {
            // Don't send placeholder password
            const passwordToSend = lPassword === '••••••••' ? '' : lPassword;
            if (lPassword !== '••••••••' && !lPassword && lEmail) {
                // If user cleared the password field and email exists, maybe they want to clear it?
                // But user request implies they want it to persist. 
                // We'll only send if it's NOT the placeholder and NOT empty (or if they actually want to clear it)
            }

            const res = await fetch('/api/save-linkedin-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, lEmail, lPassword: passwordToSend })
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                if (passwordToSend) setLPassword('••••••••');
            } else {
                alert(data.message || 'Error saving credentials');
            }
        } catch (err) {
            alert('Error saving credentials');
        }
    };

    const handleStartAutoApply = async () => {
        if (!lEmail || !lPassword || lPassword === '') {
            alert('Please provide your LinkedIn Email and Password first.');
            // Scroll to the LinkedIn settings section
            const section = document.getElementById('linkedin-credentials-section');
            if (section) {
                section.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        try {
            setIsAutoApplying(true);
            const res = await fetch('/api/automation/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Automation started background. You can track progress in the Dashboard.');
            } else {
                alert(data.message || 'Error starting automation');
            }
        } catch (err) {
            alert('Error starting automation');
        } finally {
            setIsAutoApplying(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Job Preferences</h2>

            <GravityCard delay={0.1}>
                <div className="animate-fall-in" style={{ animationDelay: '0.1s', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Full Name</label>
                    <input
                        type="text"
                        placeholder="Your Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        style={{
                            width: '100%',
                            background: 'var(--glass-bg)',
                            border: errors.name ? '1px solid #ff4444' : '1px solid var(--glass-border)',
                            padding: '1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontFamily: 'Inter',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                    />
                    {errors.name && <span style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '0.2rem' }}>{errors.name}</span>}
                </div>

                {user?.skills?.length > 0 && (
                    <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(0, 243, 255, 0.05)', borderRadius: '8px', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', marginBottom: '0.5rem', fontWeight: 'bold' }}>Based on your resume skills:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {user.skills.slice(0, 5).map((skill, i) => (
                                <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>{skill}</span>
                            ))}
                        </div>
                    </div>
                )}

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
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Suggestions:</span>
                    {roleSuggestions.map(role => (
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

                <button onClick={handleSavePreferences} style={{
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
            <GravityCard delay={0.2} style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--accent-violet)', marginBottom: '1.2rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🤖 Agent Settings
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    Provide your LinkedIn credentials so the AI agent can apply on your behalf. These are stored with bank-grade encryption.
                </p>

                <div className="animate-fall-in" style={{ animationDelay: '0.1s', marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>LinkedIn Email</label>
                    <input
                        type="email"
                        placeholder="your-linkedin@email.com"
                        value={lEmail}
                        onChange={(e) => setLEmail(e.target.value)}
                        style={{
                            width: '100%',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            color: 'white',
                            outline: 'none'
                        }}
                    />
                </div>

                <div className="animate-fall-in" style={{ animationDelay: '0.2s', marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.85rem' }}>LinkedIn Password</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showLinkedInPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={lPassword}
                            onChange={(e) => setLPassword(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                padding: '0.8rem',
                                paddingRight: '2.5rem',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowLinkedInPassword(!showLinkedInPassword)}
                            style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
                        >
                            {showLinkedInPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleLinkedInSave}
                    style={{
                        width: '100%',
                        padding: '0.8rem',
                        background: 'transparent',
                        border: '1px solid var(--accent-violet)',
                        color: 'var(--accent-violet)',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                    }}
                >
                    Save LinkedIn Settings
                </button>
            </GravityCard>
        </div>
    );
};

export default Preferences;
