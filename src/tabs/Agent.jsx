import React, { useState, useEffect, useRef } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const TimelineItem = ({ company, role, status, date, delay, isMatch = false, onApply = null, isApplying = false, matchScore = null }) => (
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
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.3rem' }}>
                        <h3 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', color: isMatch ? 'var(--accent-cyan)' : 'white', margin: 0 }}>{role}</h3>
                        {matchScore && (
                            <span style={{
                                background: 'rgba(0, 243, 255, 0.1)',
                                color: 'var(--accent-cyan)',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                border: '1px solid rgba(0, 243, 255, 0.2)'
                            }}>
                                {matchScore}% Match
                            </span>
                        )}
                    </div>
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
    const [isAutoApplying, setIsAutoApplying] = useState(false);
    const [localApplied, setLocalApplied] = useState([]);

    // Hybrid Remote View State
    const [liveFrame, setLiveFrame] = useState(null);
    const [showHUD, setShowHUD] = useState(false);
    const socketRef = useRef(null);

    // Cover Letter State
    const [draftingId, setDraftingId] = useState(null);
    const [activeLetter, setActiveLetter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Initialize Socket.IO connection
        // In local dev, it's localhost:5000. In production, it's the same origin.
        const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin;
        socketRef.current = io(socketUrl);

        socketRef.current.on('agent-view', (data) => {
            if (data.image) {
                setLiveFrame(`data:image/png;base64,${data.image}`);
                setShowHUD(true);
            }
        });

        return () => {
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    const handleSingleApply = async (job, index) => {
        setApplyingId(index);
        setShowHUD(true); // Open HUD to show progress
        try {
            const res = await fetch('/api/start-single-apply', {
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

    const handleAutoApply = async () => {
        if (!window.confirm("Start AI Auto-Pilot? This will attempt to apply to up to 5 recommended jobs automatically.")) return;

        setIsAutoApplying(true);
        setShowHUD(true);
        try {
            const res = await fetch('/api/start-auto-apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });
            const data = await res.json();

            if (data.user) updateUser(data.user);
            alert(data.message || "Auto-pilot process completed.");
        } catch (err) {
            alert('Server error starting auto-pilot');
        }
        setIsAutoApplying(false);
    };

    const handleDraftLetter = async (job, index) => {
        setDraftingId(index);
        try {
            const res = await fetch('/api/generate-cover-letter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email, job })
            });
            const data = await res.json();
            if (data.letter) {
                setActiveLetter({ ...job, text: data.letter });
                setIsModalOpen(true);
            } else {
                alert("Failed to generate letter");
            }
        } catch (err) {
            alert("Error drafting letter");
        }
        setDraftingId(null);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(activeLetter.text);
        alert("Cover letter copied to clipboard!");
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
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem', paddingBottom: '10rem' }}>

            {/* Hybrid Remote View HUD */}
            {showHUD && (
                <div style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    width: '320px',
                    height: '240px',
                    zIndex: 1000,
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: '#000',
                    border: '2px solid var(--accent-blue)',
                    boxShadow: '0 0 30px rgba(0, 243, 255, 0.3)',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--accent-blue)',
                        color: 'black',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span>🤖 AGENT LIVE HUD</span>
                        <button onClick={() => setShowHUD(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>×</button>
                    </div>
                    <div style={{ flex: 1, position: 'relative', background: '#0a192f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {liveFrame ? (
                            <img src={liveFrame} alt="Agent View" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                <div className="animate-pulse">🔄 Connecting to Agent...</div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 className="animate-fall-in" style={{ margin: 0, fontFamily: 'Outfit', color: 'white' }}>Application Agent</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    {liveFrame && !showHUD && (
                        <button
                            onClick={() => setShowHUD(true)}
                            style={{
                                background: 'rgba(0, 243, 255, 0.1)',
                                border: '1px solid var(--accent-blue)',
                                color: 'var(--accent-blue)',
                                padding: '0.5rem 1rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                            }}
                        >
                            👁️ Restore HUD
                        </button>
                    )}
                    {matches.length > 0 && (
                        <button
                            onClick={handleAutoApply}
                            disabled={isAutoApplying}
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-violet))',
                                border: 'none',
                                color: 'white',
                                padding: '0.8rem 1.5rem',
                                borderRadius: '30px',
                                fontWeight: 'bold',
                                cursor: isAutoApplying ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 0 20px rgba(0, 243, 255, 0.4)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {isAutoApplying ? '🚀 Auto-Pilot Active...' : '🚀 Start AI Auto-Pilot'}
                        </button>
                    )}
                </div>
            </div>

            <section style={{ marginBottom: '3rem' }}>
                <h3 style={{ color: 'var(--accent-cyan)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Suited Job Matches</h3>
                {matches.length > 0 ? (
                    matches.map((job, i) => {
                        return (
                            <div key={`match-container-${i}`} style={{ position: 'relative' }}>
                                <TimelineItem
                                    key={`match-${i}`}
                                    company={job.company}
                                    role={job.title}
                                    status="Pending"
                                    delay={0.1 * i}
                                    isMatch={true}
                                    matchScore={job.matchScore || Math.floor(Math.random() * (95 - 75 + 1)) + 75} // Fallback for UI demo
                                    isApplying={applyingId === i}
                                    onApply={() => handleSingleApply(job, i)}
                                />
                                <button
                                    onClick={() => handleDraftLetter(job, i)}
                                    disabled={draftingId === i}
                                    style={{
                                        position: 'absolute',
                                        right: '120px',
                                        top: '1.8rem',
                                        background: 'rgba(176, 38, 255, 0.1)',
                                        border: '1px solid var(--accent-violet)',
                                        color: 'var(--accent-violet)',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '15px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        cursor: draftingId === i ? 'wait' : 'pointer',
                                        transition: 'all 0.3s',
                                        zIndex: 2
                                    }}
                                >
                                    {draftingId === i ? '✍️ Drafting...' : '📝 Draft Letter'}
                                </button>
                            </div>
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

            {/* Cover Letter Modal */}
            {isModalOpen && activeLetter && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '1rem'
                }}>
                    <GravityCard style={{ maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ color: 'var(--accent-violet)', margin: 0 }}>AI Cover Letter Draft</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                            For <strong>{activeLetter.title}</strong> at <strong>{activeLetter.company}</strong>
                        </p>
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontFamily: 'Inter',
                            lineHeight: '1.6',
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.95rem',
                            border: '1px solid var(--glass-border)',
                            marginBottom: '2rem'
                        }}>
                            {activeLetter.text}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={copyToClipboard} style={{
                                flex: 1,
                                background: 'var(--accent-blue)',
                                border: 'none',
                                color: 'black',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}>
                                Copy to Clipboard
                            </button>
                            <button onClick={() => setIsModalOpen(false)} style={{
                                flex: 1,
                                background: 'transparent',
                                border: '1px solid var(--text-secondary)',
                                color: 'white',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}>
                                Close
                            </button>
                        </div>
                    </GravityCard>
                </div>
            )}
        </div>
    );
};

export default Agent;
