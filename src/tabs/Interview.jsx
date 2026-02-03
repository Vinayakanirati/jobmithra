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
                    z-index: 9999;
                    position: fixed; /* Use fixed for better control */
                    bottom: 0px;
                    right: 0px;
                    transform: translateX(-50%);
                    
                    /* Desktop Dimensions - Larger */
                    --df-messenger-chat-window-height: 85vh;
                    --df-messenger-chat-window-width: 60vw;
                    --df-messenger-chat-window-offset-bottom: 2rem;
                    
                    /* Application Theme (Dark/Neon) */
                    --df-messenger-font-color: #e6f1ff;
                    --df-messenger-font-family: 'Outfit', sans-serif;
                    --df-messenger-chat-background: #0a192f; /* var(--bg-primary) */
                    --df-messenger-message-user-background: rgba(0, 243, 255, 0.2); /* var(--accent-blue) with opacity */
                    /* Message Content Fixes */
                    --df-messenger-message-bot-background: rgba(255, 255, 255, 0.1); 
                    --df-messenger-message-user-background: rgba(0, 243, 255, 0.2);
                    
                    /* Chip/Button Fixes for Dark Mode */
                    --df-messenger-chip-background: rgba(255, 255, 255, 0.1);
                    --df-messenger-chip-color: #e6f1ff;
                    --df-messenger-chip-border-color: rgba(255, 255, 255, 0.2);
                }

                /* Deep selector to target internal messenger elements */
                df-messenger >>> .df-messenger-message-piece {
                    background-color: transparent !important;
                    color: inherit !important;
                }

                /* Target the specific "white blobs" (often <code> or specialized spans) */
                df-messenger >>> code, 
                df-messenger >>> .df-messenger-content span {
                    background-color: rgba(255, 255, 255, 0.1) !important;
                    color: #00f3ff !important;
                    padding: 2px 6px !important;
                    border-radius: 4px !important;
                }

                /* Fix for suggestion chips and buttons */
                df-messenger >>> .df-messenger-suggestion-wrapper button {
                    background-color: rgba(0, 243, 255, 0.1) !important;
                    color: #00f3ff !important;
                    border: 1px solid rgba(0, 243, 255, 0.3) !important;
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
