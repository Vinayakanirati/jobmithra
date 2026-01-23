import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/animations.css';

const TABS = [
    { id: 'home', label: 'Home', icon: '🏠', public: true },
    { id: 'resume', label: 'Resume Analyzer', icon: '📄', public: false },
    { id: 'preferences', label: 'Job Preferences', icon: '🎯', public: false },
    { id: 'agent', label: 'Application Agent', icon: '🤖', public: false },
    { id: 'interview', label: 'Interview Prep', icon: '💬', public: false },
    { id: 'dashboard', label: 'Dashboard', icon: '📊', public: false },
    { id: 'profile', label: 'Profile', icon: '👤', public: false },
];

const Navigation = ({ activeTab, onTabChange, isAuthenticated, onLoginClick, isOpen, onClose, isMobile }) => {
    const { logout } = useAuth();

    const sidebarStyle = isMobile ? {
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        width: '280px',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        background: 'rgba(10, 25, 47, 0.95)',
        backdropFilter: 'blur(10px)',
        zIndex: 100,
        padding: '2rem 1rem',
        borderRight: '1px solid var(--glass-border)',
        boxShadow: isOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'
    } : {
        width: '260px',
        height: '100%',
        background: 'rgba(10, 25, 47, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRight: '1px solid var(--glass-border)',
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10,
        transition: 'all 0.3s ease'
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    onClick={onClose}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: 'rgba(0,0,0,0.6)',
                        zIndex: 90
                    }}
                />
            )}

            <nav style={sidebarStyle} className="mobile-nav">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', paddingLeft: '1rem' }}>
                    <div className="animate-float">
                        <h1 style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--accent-blue)',
                            textShadow: '0 0 15px rgba(0, 243, 255, 0.5)'
                        }}>
                            JobMithra
                        </h1>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>AI Companion</p>
                    </div>
                    {isMobile && (
                        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>
                            ✕
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {TABS.map((tab, index) => {
                        // Logic to show tabs:
                        // 1. If public, always show
                        // 2. If authenticated, show all
                        // 3. If !authenticated, hide private
                        if (!tab.public && !isAuthenticated) return null;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    onTabChange(tab.id);
                                    if (isMobile) onClose();
                                }}
                                style={{
                                    background: activeTab === tab.id ? 'var(--glass-bg)' : 'transparent',
                                    border: '1px solid',
                                    borderColor: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
                                    color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s var(--ease-smooth)',
                                    fontFamily: 'Inter, sans-serif',
                                    fontSize: '0.95rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    animation: `fall-in 0.5s var(--ease-bounce) backwards`,
                                    animationDelay: `${index * 0.05}s`
                                }}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {!isAuthenticated ? (
                    <div style={{ marginTop: 'auto' }}>
                        <button
                            onClick={() => {
                                onLoginClick();
                                if (isMobile) onClose();
                            }}
                            className="animate-fall-in"
                            style={{
                                width: '100%',
                                background: 'var(--accent-violet)',
                                border: 'none',
                                color: 'white',
                                padding: '1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: '0 0 10px rgba(176, 38, 255, 0.3)'
                            }}
                        >
                            Login / Register
                        </button>
                    </div>
                ) : (
                    <div style={{ marginTop: 'auto' }}>
                        <button
                            onClick={() => {
                                logout();
                                if (isMobile) onClose();
                            }}
                            style={{
                                width: '100%',
                                background: 'rgba(255, 68, 68, 0.1)',
                                border: '1px solid #ff4444',
                                color: '#ff4444',
                                padding: '1rem',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                transition: 'all 0.3s'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                )}
            </nav>
        </>
    );
};

export default Navigation;
