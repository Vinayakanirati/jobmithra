import React, { useEffect } from 'react';

const Interview = () => {
    useEffect(() => {
        const applyCustomStyles = () => {
            const messenger = document.querySelector('df-messenger');
            if (messenger && messenger.shadowRoot) {
                const sheet = new CSSStyleSheet();
                sheet.replaceSync(`
                    div.chat-wrapper[opened="true"] .message-list-wrapper {
                        background-color: #0a192f !important;
                    }
                    /* Aggressively target all input wrappers found in DOM */
                    div.input-container, 
                    .input-box-wrapper,
                    .input-wrapper,
                    .input-element-wrapper,
                    .input-content-wrapper {
                        background-color: #0a192f !important; /* var(--bg-primary) */
                        color: #e6f1ff !important;
                    }
                    /* Handle top border for separation if needed */
                    .input-box-wrapper {
                        border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
                    }
                    input[type="text"] {
                        background-color: transparent !important; /* Try transparent to let whatever background is there show, or default white */
                        color: #000000 !important; /* Black text as requested */
                        border: 1px solid rgba(0, 0, 0, 0.1) !important;
                    }
                    input[type="text"]::placeholder {
                        color: rgba(0, 0, 0, 0.6) !important;
                    }
                    }
                    button#sendIcon,
                    button#micIcon,
                    #micIcon, /* Try direct ID too */
                    .df-messenger-mic-button {
                         fill: #000000 !important; /* Black icon for visibility */
                         color: #000000 !important;
                         display: inline-block !important;
                         opacity: 1 !important;
                         z-index: 100 !important;
                    }
                    .df-messenger-titlebar {
                        background-color: rgba(10, 25, 47, 0.7) !important; /* var(--bg-secondary) */
                        color: #e6f1ff !important;
                    }
                `);
                messenger.shadowRoot.adoptedStyleSheets = [
                    ...messenger.shadowRoot.adoptedStyleSheets,
                    sheet
                ];
            }
        };

        // Try to apply immediately and then on a delay to handle render timing
        const timeout = setTimeout(applyCustomStyles, 1000);
        window.addEventListener('df-messenger-loaded', applyCustomStyles);

        return () => {
            clearTimeout(timeout);
            window.removeEventListener('df-messenger-loaded', applyCustomStyles);
        };
    }, []);

    return (
        <div style={{ height: '100%', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ height: '90vh', overflowY: 'auto', padding: '2rem' }}></div>
            {/* Dialogflow Web Component */}
            <df-messenger
                location="us-central1"
                project-id="jobmithra"
                agent-id="ae28c046-bd45-43fd-a170-4b79d2696eec"
                language-code="en"
                max-query-length="-1"
                allow-microphone="true">
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
                    --df-messenger-font-color: var(--text-primary);
                    --df-messenger-font-family: var(--font-main);
                    --df-messenger-chat-background: var(--bg-primary);
                    --df-messenger-message-user-background: rgba(0, 243, 255, 0.15); /* var(--accent-blue) with opacity */
                    --df-messenger-message-bot-background: var(--bg-secondary); /* Darker background for bot */
                    
                    /* Chip/Button Fixes for Dark Mode */
                    --df-messenger-chip-background: rgba(0, 243, 255, 0.05);
                    --df-messenger-chip-color: var(--accent-cyan);
                    --df-messenger-chip-border-color: var(--glass-border);

                    /* Input Area Styling */
                    --df-messenger-input-font-color:black;
                    --df-messenger-input-background: black;
                    --df-messenger-input-box-color: var(--bg-primary); 
                    --df-messenger-input-placeholder-font-color: var(--text-secondary);
                    --df-messenger-send-icon: var(--accent-cyan);

                    /* Titlebar/Header Styling */
                    --df-messenger-titlebar-background: var(--bg-secondary);
                    --df-messenger-titlebar-font-color: var(--text-primary);
                }

                /* Deep selector to target internal messenger elements */
                df-messenger >>> .df-messenger-message-piece {
                    background-color: transparent !important;
                }

                /* Target the specific "white blobs" (often <code> or specialized spans) */
                df-messenger >>> code, 
                df-messenger >>> .df-messenger-content span {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    color: var(--accent-cyan) !important;
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
