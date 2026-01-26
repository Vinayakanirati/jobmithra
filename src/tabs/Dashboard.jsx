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
                    title="Internships"
                    value={user?.internships?.length || 0}
                    subtext="Extracted from resume"
                    color="#ff9d00"
                    delay={0.4}
                />
                <StatCard
                    title="Interviews / Accepted"
                    value={user?.acceptedCount || 0}
                    subtext="Successful advances"
                    color="#00ff88"
                    delay={0.5}
                />
                <StatCard
                    title="Rejected / Closed"
                    value={user?.rejectedCount || 0}
                    subtext="Applications closed"
                    color="#ff4444"
                    delay={0.6}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <GravityCard delay={0.4} style={{ minHeight: '200px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--accent-cyan)' }}>Skills Identified</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                        {skills.length > 0 ? (
                            skills.map((skill, i) => (
                                <span key={i} style={{
                                    padding: '0.4rem 0.8rem',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-primary)'
                                }}>
                                    {skill}
                                </span>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)' }}>No skills extracted yet.</p>
                        )}
                    </div>
                </GravityCard>

                <GravityCard delay={0.5} style={{ minHeight: '200px' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--accent-violet)' }}>Key Achievements</h3>
                    <ul style={{ color: 'var(--text-primary)', paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                        {user?.achievements && user.achievements.length > 0 ? (
                            user.achievements.map((ach, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>{ach}</li>
                            ))
                        ) : (
                            <li style={{ color: 'var(--text-secondary)' }}>Analyze resume to see achievements here.</li>
                        )}
                    </ul>
                </GravityCard>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
                <GravityCard delay={0.6}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--accent-blue)' }}>Recent Activity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {user?.applications && user.applications.length > 0 ? (
                            user.applications.slice().reverse().slice(0, 3).map((app, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: `3px solid ${app.status === 'Applied' ? '#00ff88' : 'var(--accent-blue)'}` }}>
                                    <div>
                                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>{app.role}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{app.company}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: app.status === 'Applied' ? '#00ff88' : 'var(--accent-blue)', fontSize: '0.8rem', fontWeight: 'bold' }}>{app.status}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{new Date(app.date).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', py: '1rem' }}>No recent activity to show.</p>
                        )}
                    </div>
                </GravityCard>
            </div>
        </div>
    );
};

export default Dashboard;
