import React from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';


const StatCard = ({ title, value, subtext, color, delay }) => (
    <GravityCard delay={delay}>
        <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</h3>
        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: color, marginBottom: '0.5rem' }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{subtext}</div>
    </GravityCard>
);

const Dashboard = () => {
    const { user } = useAuth();

    // Default values if user not logged in or data missing
    const jobsApplied = user?.jobsApplied || 0;
    const skills = user?.skills || [];
    const applicationsCount = user?.applications?.length || 0;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Welcome back, {user?.name || 'Guest'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Applications Sent"
                    value={jobsApplied || applicationsCount}
                    subtext="Total processed applications"
                    color="var(--accent-blue)"
                    delay={0.1}
                />
                <StatCard
                    title="Skills Extracted"
                    value={skills.length}
                    subtext={`${skills.slice(0, 3).join(', ')}${skills.length > 3 ? '...' : ''}`}
                    color="var(--accent-violet)"
                    delay={0.2}
                />
                <StatCard
                    title="Profile Completion"
                    value={user?.resume ? '100%' : '50%'}
                    subtext={user?.resume ? "Resume uploaded" : "Upload resume to improve"}
                    color="var(--accent-cyan)"
                    delay={0.3}
                />
                <StatCard
                    title="Experience Level"
                    value={user?.experienceLevel || 'N/A'}
                    subtext="Based on resume analysis"
                    color="#ff9d00"
                    delay={0.4}
                />
            </div>

            <GravityCard delay={0.4} style={{ minHeight: '300px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Skills Identified</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {skills.length > 0 ? (
                        skills.map((skill, i) => (
                            <span key={i} style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                color: 'var(--text-primary)'
                            }}>
                                {skill}
                            </span>
                        ))
                    ) : (
                        <p style={{ color: 'var(--text-secondary)' }}>No skills extracted yet. Please upload and analyze your resume.</p>
                    )}
                </div>
            </GravityCard>
        </div>
    );
};

export default Dashboard;
