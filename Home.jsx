import React from 'react';
import '../styles/animations.css';
import { useAuth } from '../context/AuthContext';

const Home = ({ onNavigate }) => {
    const { isAuthenticated } = useAuth();
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '80vh',
            textAlign: 'center'
        }}>
            <div className="animate-float" style={{
                fontSize: '100px',
                marginBottom: '2rem',
                filter: 'drop-shadow(0 0 20px rgba(0, 243, 255, 0.4))'
            }}>
                🛸
            </div>

            <h1 className="animate-fall-in" style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '4rem',
                fontWeight: '700',
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #fff 0%, var(--text-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(0, 243, 255, 0.2)'
            }}>
                Your AI Companion<br />Until You Get Hired
            </h1>

            <p className="animate-fall-in" style={{
                animationDelay: '0.2s',
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
                maxWidth: '600px',
                lineHeight: '1.6',
                marginTop: '1rem'
            }}>
                JobMithra stays with you through every application, rejection, and offer.
                You are not alone in this journey.
            </p>

            <div className="animate-fall-in" style={{ animationDelay: '0.4s', marginTop: '3rem', display: 'flex', gap: '1rem' }}>
                {isAuthenticated ? (
                    <p style={{ color: 'var(--accent-blue)', fontSize: '1.1rem' }}>
                        Select a tab from the sidebar to continue.
                    </p>
                ) : (
                    <button style={{
                        padding: '1rem 2rem',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        borderRadius: '50px',
                        border: 'none',
                        background: 'var(--accent-blue)',
                        color: '#000',
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(0, 243, 255, 0.4)',
                        transition: 'transform 0.2s'
                    }}
                        onClick={() => onNavigate('login')}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Start Journey
                    </button>
                )}
            </div>
        </div>
    );
};

export default Home;
