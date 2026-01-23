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
    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Your Progress</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <StatCard title="Applications Sent" value="24" subtext="+5 this week" color="var(--accent-blue)" delay={0.1} />
                <StatCard title="Interviews Scheduled" value="3" subtext="1 pending confirmation" color="var(--accent-violet)" delay={0.2} />
                <StatCard title="Response Rate" value="12%" subtext="Industry avg: 8%" color="var(--accent-cyan)" delay={0.3} />
            </div>

            <GravityCard delay={0.4} style={{ minHeight: '300px' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Activity Overview</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '1rem' }}>
                    {[40, 60, 30, 80, 50, 90, 70].map((h, i) => (
                        <div key={i} style={{
                            flex: 1,
                            background: `linear-gradient(to top, rgba(0, 243, 255, 0.2), rgba(0, 243, 255, 0.6))`,
                            height: `${h}%`,
                            borderRadius: '6px',
                            transition: 'height 0.5s ease'
                        }} />
                    ))}
                </div>
            </GravityCard>
        </div>
    );
};

export default Dashboard;
