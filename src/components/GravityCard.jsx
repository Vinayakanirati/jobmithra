import React from 'react';
import '../styles/animations.css';

const GravityCard = ({ children, delay = 0, style, className = '', ...props }) => {
    return (
        <div
            className={`gravity-card animate-fall-in ${className}`}
            style={{
                background: 'rgba(17, 34, 64, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '1.5rem',
                animationDelay: `${delay}s`,
                position: 'relative',
                ...style
            }}
            {...props}
        >
            {children}
        </div>
    );
};

export default GravityCard;
