import React from 'react';

const Interview = () => {
    return (
        <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ height: '90vh', overflowY: 'auto', padding: '2rem' }}></div>
            {/* Dialogflow Web Component */}
            <df-messenger
                location="us-central1"
                project-id="jobmithra"
                agent-id="ae28c046-bd45-43fd-a170-4b79d2696eec"
                language-code="en"
                max-query-length="-1">
                <df-messenger-chat-bubble
                    chat-title="Job_search">
                </df-messenger-chat-bubble>
            </df-messenger>

            <style>{`
                df-messenger {
                    z-index: 99999;
                    position: absolute;
                    top: 100%;
                    right: 0px;
                    
                    /* Application Theme (Dark/Neon) */
                    --df-messenger-font-color: #e6f1ff; /* var(--text-primary) */
                    --df-messenger-font-family: 'Outfit', sans-serif;
                    --df-messenger-chat-background: #0a192f; /* var(--bg-primary) */
                    --df-messenger-message-user-background: rgba(0, 243, 255, 0.2); /* var(--accent-blue) with opacity */
                    --df-messenger-message-bot-background: rgba(255, 255, 255, 0.1); /* var(--glass-bg) */
                    --df-messenger-input-box-background: #0a192f;
                    --df-messenger-input-font-color: #e6f1ff;
                    --df-messenger-send-icon: #00f3ff; /* var(--accent-blue) */
                    --df-messenger-minimized-chat-close-icon-color: #e6f1ff;
                    
                    /* Title Bar Fixes */
                    --df-messenger-titlebar-background: #0a192f;
                    --df-messenger-titlebar-font-color: #e6f1ff;
                    --df-messenger-titlebar-close-icon-color: #e6f1ff;
                    --df-messenger-titlebar-minimize-icon-color: #e6f1ff;
                    
                    /* Desktop Dimensions */
                    --df-messenger-chat-window-height: 90vh;
                    --df-messenger-chat-window-width: 75vw;
                    --df-messenger-chat-window-offset-bottom: 0px;
                    --df-messenger-chat-window-offset-right: 0px;
                    
                    /* Force Opacity */
                    opacity: 1 !important;
                    visibility: visible !important;
                }

                @media (max-width: 768px) {
                    df-messenger {
                        /* Mobile Dimensions (Full Screen) */
                        --df-messenger-chat-window-width: 100vw;
                    }
                }
            `}</style>
        </div>
    );
};

export default Interview;
