import React from 'react';
import GravityCard from '../components/GravityCard';

const Resume = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Resume Analyzer</h2>

            <GravityCard delay={0.1} style={{
                border: '2px dashed var(--glass-border)',
                height: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '2rem'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }} className="animate-float">📂</div>
                <p style={{ color: 'var(--text-secondary)' }}>Drag & Drop your resume here</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: '0.5rem' }}>Supports PDF, DOCX</p>
            </GravityCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <GravityCard delay={0.2}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-cyan)' }}>Detected Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {['React', 'Node.js', 'UI/UX', 'Python', 'Leadership'].map((skill, i) => (
                            <span key={i} style={{
                                background: 'rgba(0, 243, 255, 0.1)',
                                border: '1px solid var(--accent-blue)',
                                color: 'var(--accent-blue)',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.85rem',
                                boxShadow: '0 0 5px rgba(0, 243, 255, 0.2)'
                            }}>
                                {skill}
                            </span>
                        ))}
                    </div>
                </GravityCard>

                <GravityCard delay={0.3}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-violet)' }}>Improvements</h3>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        <li>Add more quantitative results to your "Senior Dev" role.</li>
                        <li>Highlight "Mentorship" experience more prominently.</li>
                    </ul>
                </GravityCard>
            </div>
        </div>
    );
};

export default Resume;
