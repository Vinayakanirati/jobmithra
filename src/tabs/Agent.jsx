import React from 'react';
import GravityCard from '../components/GravityCard';

const TimelineItem = ({ company, role, status, delay }) => (
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
                background: status === 'Waiting' ? 'var(--accent-violet)' : 'var(--accent-blue)',
                position: 'relative',
                zIndex: 1,
                boxShadow: `0 0 10px ${status === 'Waiting' ? 'var(--accent-violet)' : 'var(--accent-blue)'}`
            }}></div>
        </div>

        <GravityCard delay={delay} style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem' }}>{role}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{company}</p>
                </div>
                <span style={{
                    background: status === 'Waiting' ? 'rgba(176, 38, 255, 0.2)' : 'rgba(0, 243, 255, 0.2)',
                    color: status === 'Waiting' ? 'var(--accent-violet)' : 'var(--accent-blue)',
                    padding: '0.2rem 0.8rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem'
                }}>
                    {status}
                </span>
            </div>
        </GravityCard>
    </div>
);

const Agent = () => {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Application Timeline</h2>

            <TimelineItem company="Google" role="Senior UX Engineer" status="Interview Scheduled" delay={0.1} />
            <TimelineItem company="Anthropic" role="Frontend Architect" status="Waiting" delay={0.2} />
            <TimelineItem company="Spotify" role="Design Technologist" status="Applied" delay={0.3} />
        </div>
    );
};

export default Agent;
