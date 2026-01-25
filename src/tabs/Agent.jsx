import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';

const TimelineItem = ({ company, role, status, date, delay, isMatch = false, onApply = null, isApplying = false }) => (
    <div style={{ display: 'flex', marginBottom: '2rem' }}>
        <div style={{ marginRight: '2rem', position: 'relative' }}>
            <div style={{
                width: '2px',
                height: '100%',
                background: 'rgba(255,255,255,0.1)',
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
            }}></div>
            <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: status === 'Applied' ? '#00ff88' : (status === 'Pending' ? 'var(--accent-violet)' : 'var(--accent-blue)'),
                position: 'relative',
                zIndex: 1,
                boxShadow: `0 0 10px ${status === 'Applied' ? '#00ff88' : (status === 'Pending' ? 'var(--accent-violet)' : 'var(--accent-blue)')}`
            }}></div>
        </div>

        <GravityCard delay={delay} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', color: isMatch ? 'var(--accent-cyan)' : 'white' }}>{role}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{company} {date && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>• {new Date(date).toLocaleDateString()}</span>}</p>
                </div>
                {isMatch ? (
                    <button
                        onClick={onApply}
                        disabled={isApplying || status === 'Applied'}
                        style={{
                            background: status === 'Applied' ? '#00ff88' : 'var(--accent-blue)',
                            border: 'none',
                            color: '#000',
                            padding: '0.5rem 1.2rem',
                            borderRadius: '20px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            cursor: isApplying ? 'wait' : 'pointer',
                            transition: 'all 0.3s',
                            boxShadow: `0 0 15px ${status === 'Applied' ? 'rgba(0, 255, 136, 0.4)' : 'rgba(0, 243, 255, 0.3)'}`
                        }}
                    >
                        {isApplying ? 'Applying...' : (status === 'Applied' ? 'Applied ✓' : 'Apply Now')}
                    </button>
                ) : (
                    <span style={{
                        background: 'rgba(0, 243, 255, 0.1)',
                        border: '1px solid var(--accent-blue)',
                        color: 'var(--accent-blue)',
                        padding: '0.2rem 0.8rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem'
                    }}>
                        {status}
                    </span>
                )}
            </div>
        </GravityCard>
    </div>
);

const Agent = () => {
    const { user, updateUser } = useAuth();
    const [applyingId, setApplyingId] = useState(null);
    const [localApplied, setLocalApplied] = useState([]);

    const handleSingleApply = async (job, index) => {
        setApplyingId(index);
        try {
            const res = await fetch('http://localhost:5000/api/start-single-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, job })
            });
            const data = await res.json();

            if (data.results && data.results[0].status === 'Applied') {
                if (data.user) updateUser(data.user);
                setLocalApplied([...localApplied, index]);
                alert('Job applied successfully!');
            } else {
                alert(data.message || 'Automation encounterd an issue. Please check your email.');
            }
        } catch (err) {
            alert('Server error starting automation');
        }
        setApplyingId(null);
    };

    const applications = user?.applications || [];
    const matches = (user?.jobMatches || []).filter((job, i) => {
        // 1. Check local transient state
        if (localApplied.includes(i)) return false;

        // 2. Check against database record
        const alreadyApplied = applications.some(app =>
            app.company.toLowerCase() === job.company.toLowerCase() &&
            app.role.toLowerCase() === job.title.toLowerCase()
        );

        return !alreadyApplied;
    });

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Application Agent</h2>

            <section style={{ marginBottom: '3rem' }}>
                <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Suited Job Matches</h3>
                {matches.length > 0 ? (
                    matches.map((job, i) => {
                        return (
                            <TimelineItem
                                key={`match-${i}`}
                                company={job.company}
                                role={job.title}
                                status="Pending"
                                delay={0.1 * i}
                                isMatch={true}
                                isApplying={applyingId === i}
                                onApply={() => handleSingleApply(job, i)}
                            />
                        );
                    })
                ) : (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No matches found yet. Perfect your preferences!</p>
                )}
            </section>

            <section>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Application History</h3>
                {applications.length > 0 ? (
                    applications.slice().reverse().map((app, i) => (
                        <TimelineItem
                            key={`app-${i}`}
                            company={app.company}
                            role={app.role}
                            status={app.status}
                            date={app.date}
                            delay={0.1 * i}
                        />
                    ))
                ) : (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>Once you apply, your journey will appear here.</p>
                )}
            </section>
        </div>
    );
};

export default Agent;
