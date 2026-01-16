import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import '../styles/animations.css';

const Layout = ({ activeTab, onTabChange, isAuthenticated, onLoginClick, children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setIsSidebarOpen(false); // Reset on desktop
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>

            {/* Mobile Hamburger Button */}
            {isMobile && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 50,
                        background: 'rgba(10, 25, 47, 0.8)',
                        border: '1px solid var(--glass-border)',
                        color: 'var(--accent-blue)',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '1.5rem',
                        backdropFilter: 'blur(5px)'
                    }}
                >
                    ☰
                </button>
            )}

            <Navigation
                activeTab={activeTab}
                onTabChange={onTabChange}
                isAuthenticated={isAuthenticated}
                onLoginClick={onLoginClick}
                isMobile={isMobile}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                padding: '2rem',
                paddingTop: isMobile ? '4rem' : '2rem' // Add space for hamburger
            }}>
                {/* Background Animation Layer */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    pointerEvents: 'none',
                    background: 'radial-gradient(circle at 80% 20%, rgba(0, 243, 255, 0.05) 0%, transparent 40%), radial-gradient(circle at 20% 80%, rgba(176, 38, 255, 0.05) 0%, transparent 40%)'
                }}>
                    {/* Particles can go here */}
                </div>

                {/* Content Layer */}
                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    height: '100%',
                    overflowY: 'auto',
                    scrollBehavior: 'smooth'
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
