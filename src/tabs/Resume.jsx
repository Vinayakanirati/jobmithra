import React, { useState } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';

const Resume = () => {
    const { user } = useAuth();
    const [analyzing, setAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);

    const analyzeResume = async () => {
        if (!user?.resume) return;

        setAnalyzing(true);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/analyze-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: user.email })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Analysis failed');

            setAnalysisData(data);
        } catch (error) {
            console.error("Analysis failed:", error);
            alert("Failed to analyze resume. Make sure backend is running and API key is set.");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Resume Analyzer</h2>

            {user?.resume ? (
                <GravityCard delay={0.1} style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'var(--accent-blue)' }}>Your Resume</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={analyzeResume}
                                disabled={analyzing}
                                style={{
                                    background: 'var(--accent-blue)',
                                    border: 'none',
                                    color: 'black',
                                    padding: '0.4rem 1rem',
                                    borderRadius: '15px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    opacity: analyzing ? 0.7 : 1
                                }}
                            >
                                {analyzing ? '✨ Analyzing...' : '✨ Analyze with AI'}
                            </button>
                            <button
                                onClick={() => {
                                    const win = window.open();
                                    win.document.write(
                                        `<iframe src="${user.resume}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                    );
                                }}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid var(--accent-blue)',
                                    color: 'var(--accent-blue)',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '15px',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer'
                                }}
                            >
                                Open in New Tab
                            </button>
                        </div>
                    </div>
                    <iframe
                        src={user.resume}
                        style={{ width: '100%', height: '500px', border: 'none', borderRadius: '8px', background: 'white' }}
                        title="Resume"
                    />
                </GravityCard>
            ) : (
                <GravityCard delay={0.1} style={{
                    border: '2px dashed var(--glass-border)',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'pointer',
                    marginBottom: '2rem'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }} className="animate-float">📂</div>
                    <p style={{ color: 'var(--text-secondary)' }}>Drag & Drop your resume here</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', marginTop: '0.5rem' }}>Supports PDF, DOCX</p>
                </GravityCard>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <GravityCard delay={0.2}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-cyan)' }}>Detected Skills</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', minHeight: '100px' }}>
                        {analysisData?.skills ? (
                            analysisData.skills.map((skill, i) => (
                                <span key={i} style={{
                                    background: 'rgba(0, 243, 255, 0.1)',
                                    border: '1px solid var(--accent-blue)',
                                    color: 'var(--accent-blue)',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    boxShadow: '0 0 5px rgba(0, 243, 255, 0.2)'
                                }}>
                                    {skill}
                                </span>
                            ))
                        ) : analyzing ? (
                            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Analyzing resume...</p>
                        ) : (
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click 'Analyze with AI' to detect skills from your resume.</p>
                        )}
                    </div>
                </GravityCard>

                <GravityCard delay={0.3}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--accent-violet)' }}>Improvements</h3>
                    <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-secondary)', lineHeight: '1.6', minHeight: '100px' }}>
                        {analysisData?.improvements ? (
                            analysisData.improvements.map((point, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>{point}</li>
                            ))
                        ) : analyzing ? (
                            <li style={{ listStyle: 'none', fontStyle: 'italic' }}>Generating feedback...</li>
                        ) : (
                            <li style={{ listStyle: 'none', fontSize: '0.9rem' }}>AI suggestions will appear here.</li>
                        )}
                    </ul>
                </GravityCard>
            </div>
        </div>
    );
};

export default Resume;
