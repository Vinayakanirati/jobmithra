import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';

const Preferences = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        role: '',
        location: '',
        experience: ''
    });
    const [errors, setErrors] = useState({});

    // Use rolesSuited from user data if available
    const roleSuggestions = user?.rolesSuited?.length > 0
        ? user.rolesSuited
        : ['Full Stack Developer', 'UI Engineer', 'Tech Lead'];

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

            <h3 className="animate-fall-in" style={{ marginTop: '2rem', marginBottom: '1rem', fontFamily: 'Outfit', color: 'white', fontSize: '1.2rem' }}>Personalized Job Matches (AI Agent)</h3>

            <div style={{ display: 'grid', gap: '1rem' }}>
                {user?.jobMatches && user.jobMatches.length > 0 ? (
                    user.jobMatches.map((job, i) => (
                        <GravityCard key={i} delay={0.2 + (i * 0.1)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.2rem' }}>{job.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{job.company} • <span style={{ color: 'var(--accent-cyan)' }}>{job.level}</span></p>
                                </div>
                                <a
                                    href={job.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        background: 'rgba(0, 243, 255, 0.1)',
                                        border: '1px solid var(--accent-blue)',
                                        color: 'var(--accent-blue)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s'
                                    }}
                                    onMouseOver={(e) => e.target.style.background = 'var(--accent-blue)'}
                                    onMouseOut={(e) => e.target.style.background = 'rgba(0, 243, 255, 0.1)'}
                                    onMouseDown={(e) => e.target.style.color = 'black'}
                                    onMouseUp={(e) => e.target.style.color = 'var(--accent-blue)'}
                                >
                                    View on LinkedIn
                                </a>
                            </div>
                        </GravityCard>
                    ))
                ) : (
                    <GravityCard delay={0.2}>
                        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', py: '2rem' }}>
                            {user?.resume ? "Analyzing your experience to find the best matches..." : "Upload your resume to get personalized job recommendations."}
                        </p>
                    </GravityCard>
                )}
            </div>
        </div>
    );
};

export default Preferences;
