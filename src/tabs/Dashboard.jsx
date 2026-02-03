import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';


const StatCard = ({ title, value, subtext, color, delay, listData = null }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ position: 'relative' }}
        >
            <GravityCard delay={delay}>
                <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{title}</h3>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: color, marginBottom: '0.5rem' }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>{subtext}</div>
            </GravityCard>

            {/* Hover Popup for List Data */}
            {isHovered && listData && listData.length > 0 && (
                <div className="animate-fall-in" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '300px',
                    zIndex: 100,
                    paddingTop: '0.5rem'
                }}>
                    <div style={{
                        background: '#0a192fc0',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '1rem',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        maxHeight: '300px',
                        overflowY: 'auto'
                    }}>
                        <h4 style={{ color: color, margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{title} List</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {listData.map((item, i) => (
                                <div key={i} style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                                    <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem' }}>{item.role}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.company}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{new Date(item.date).toLocaleDateString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const Dashboard = ({ onNavigate }) => {
    const { user, updateUser } = useAuth();
    const [updatingId, setUpdatingId] = useState(null);

    // Default values if user not logged in or data missing
    const jobsApplied = user?.jobsApplied || 0;
    const skills = user?.skills || [];
    const applicationsCount = user?.applications?.length || 0;

    // Filter lists for Hover Cards
    const rejectedApps = user?.applications?.filter(app => app.status === 'Rejected') || [];
    const appliedApps = user?.applications?.filter(app => app.status === 'Applied') || [];

    // Filter list for Main Dashboard Display (Include Pending, Applied, Received Info, Accepted, Interviewing, etc.)
    const activeDashboardApps = user?.applications?.filter(app => app.status !== 'Rejected') || [];

    const handleStatusUpdate = async (appId, newStatus) => {
        setUpdatingId(appId);
        try {
            const res = await fetch('/api/update-application-status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, applicationId: appId, status: newStatus })
            });
            const data = await res.json();
            if (data.user) {
                updateUser(data.user);
            }
        } catch (err) {
            console.error("Failed to update status", err);
            alert("Failed to update status");
        }
        setUpdatingId(null);
    };

    const handlePrepareInterview = () => {
        if (onNavigate) {
            onNavigate('interview');
        } else {
            // Fallback for cases where onNavigate might not be passed
            const url = new URL(window.location.href);
            url.searchParams.set('tab', 'interview');
            window.history.pushState({}, '', url);
            window.location.reload();
        }
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Welcome back, {user?.name || 'Guest'}</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard
                    title="Applications Sent (Applied)"
                    value={jobsApplied || applicationsCount}
                    subtext="Hover to see history"
                    color="var(--accent-blue)"
                    delay={0.1}
                    listData={appliedApps}
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
                    subtext="Hover to see rejected"
                    color="#ff4444"
                    delay={0.6}
                    listData={rejectedApps}
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
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', color: 'var(--accent-blue)' }}>Actively Tracking (New & Pending)</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {activeDashboardApps && activeDashboardApps.length > 0 ? (
                            activeDashboardApps.slice().reverse().map((app, i) => (
                                <div key={app._id || i} style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '8px',
                                    borderLeft: `3px solid ${app.status === 'Accepted' ? '#00ff88' : (app.status === 'Rejected' ? '#ff4444' : 'var(--accent-blue)')}`,
                                    gap: '1rem'
                                }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>{app.role}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{app.company}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.3rem' }}>Applied: {new Date(app.date).toLocaleDateString()}</div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                        <div style={{
                                            color: app.status === 'Accepted' ? '#00ff88' : (app.status === 'Rejected' ? '#ff4444' : 'var(--accent-blue)'),
                                            fontSize: '0.9rem',
                                            fontWeight: 'bold',
                                            padding: '0.2rem 0.6rem',
                                            background: 'rgba(255,255,255,0.05)',
                                            borderRadius: '4px'
                                        }}>
                                            {app.status}
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {app.status === 'Accepted' && (
                                                <button
                                                    onClick={handlePrepareInterview}
                                                    style={{
                                                        background: 'linear-gradient(45deg, #00ff88, #00cb6a)',
                                                        border: 'none',
                                                        color: '#000',
                                                        padding: '0.4rem 0.8rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8rem',
                                                        fontWeight: 'bold',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Prepare Interview ➜
                                                </button>
                                            )}

                                            {(app.status !== 'Accepted') && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, 'Accepted')}
                                                        disabled={updatingId === app._id}
                                                        style={{
                                                            background: 'rgba(0, 255, 136, 0.1)',
                                                            border: '1px solid #00ff88',
                                                            color: '#00ff88',
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, 'Rejected')}
                                                        disabled={updatingId === app._id}
                                                        style={{
                                                            background: 'rgba(255, 68, 68, 0.1)',
                                                            border: '1px solid #ff4444',
                                                            color: '#ff4444',
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '0.7rem'
                                                        }}
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(app._id, 'Received Info')}
                                                        disabled={updatingId === app._id}
                                                        style={{
                                                            background: 'rgba(0, 243, 255, 0.1)',
                                                            border: '1px solid var(--accent-blue)',
                                                            color: 'var(--accent-blue)',
                                                            padding: '0.3rem 0.6rem',
                                                            borderRadius: '4px',
                                                            fontSize: '0.7rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        Received Info
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>No active applications tracking. Check the hover cards above or apply to new jobs!</p>
                        )}
                    </div>
                </GravityCard>
            </div>
        </div >
    );
};

export default Dashboard;
