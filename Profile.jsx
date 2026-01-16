import React, { useState, useEffect } from 'react';
import GravityCard from '../components/GravityCard';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        photo: '',
        resume: '',
        name: '',
        mobile: '',
        address: '',
        skills: '',
        education: []
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                photo: '',
                resume: '',
                name: user.name || '',
                mobile: user.mobile || '',
                address: user.address || '',
                skills: user.skills ? user.skills.join(', ') : '',
                education: user.education && user.education.length > 0 ? user.education : [{ institution: '', degree: '', year: '' }]
            });
        }
    }, [user, isEditing]);

    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                resolve(fileReader.result);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handleFileChange = async (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size too large! Please select a file smaller than 5MB.");
                e.target.value = null; // Reset input
                return;
            }
            try {
                const base64 = await convertBase64(file);
                setFormData({ ...formData, [field]: base64 });
            } catch (error) {
                console.error("Error converting file:", error);
            }
        }
    };

    const handleEducationChange = (index, field, value) => {
        const newEducation = [...formData.education];
        newEducation[index][field] = value;
        setFormData({ ...formData, education: newEducation });
    };

    const addEducation = () => {
        if (formData.education.length < 4) {
            setFormData({ ...formData, education: [...formData.education, { institution: '', degree: '', year: '' }] });
        }
    };

    const removeEducation = (index) => {
        const newEducation = formData.education.filter((_, i) => i !== index);
        setFormData({ ...formData, education: newEducation });
    };


    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:5000/api/update-profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: user.email,
                    resume: formData.resume || undefined,
                    photo: formData.photo || undefined,
                    mobile: formData.mobile,
                    address: formData.address,
                    skills: formData.skills.split(',').map(s => s.trim()).slice(0, 10),
                    education: formData.education.filter(e => e.institution || e.degree) // Filter empty entries
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Update failed');

            // Update local context
            updateUser(data.user);
            setIsEditing(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update profile: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '2rem' }}>
            <h2 className="animate-fall-in" style={{ marginBottom: '2rem', fontFamily: 'Outfit', color: 'white' }}>Profile & Settings</h2>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flexDirection: 'column' }} className="animate-fall-in">
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--glass-bg)',
                        border: '2px solid var(--accent-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {user?.photo ? <img src={user.photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👨‍💻'}
                    </div>

                    <div style={{ flex: 1 }}>
                        {!isEditing ? (
                            <>
                                <h3 style={{ fontSize: '2rem', fontFamily: 'Outfit', marginBottom: '0.2rem' }}>{user?.name || 'User'}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>{user?.email || 'Candidate'}</p>

                                {user?.mobile && <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>📞 {user.mobile}</p>}
                                {user?.address && <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>📍 {user.address}</p>}

                                {user?.skills && user.skills.length > 0 && (
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {user.skills.map((skill, i) => (
                                            <span key={i} style={{ background: 'rgba(0, 243, 255, 0.1)', color: 'var(--accent-blue)', padding: '0.3rem 0.8rem', borderRadius: '15px', fontSize: '0.8rem' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {user?.resume && (
                                    <div style={{ marginTop: '1rem' }}>
                                        <span style={{ color: 'var(--accent-violet)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                            📄 Resume On File
                                        </span>
                                    </div>
                                )}

                                <button onClick={() => setIsEditing(true)} style={{ marginTop: '1.5rem', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '0.5rem 1.2rem', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.3s' }}>
                                    Edit Profile
                                </button>
                            </>
                        ) : (
                            <form onSubmit={handleUpdate} style={{ background: 'var(--glass-bg)', padding: '1.5rem', borderRadius: '12px', width: '100%' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Mobile</label>
                                        <input type="text" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Address</label>
                                        <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white' }} />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Skills (Comma separated, Max 10)</label>
                                    <input type="text" value={formData.skills} onChange={e => setFormData({ ...formData, skills: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'white' }} />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Education (Max 4)</label>
                                    {formData.education.map((edu, index) => (
                                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <input placeholder="Institution" value={edu.institution} onChange={e => handleEducationChange(index, 'institution', e.target.value)} style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} />
                                            <input placeholder="Degree" value={edu.degree} onChange={e => handleEducationChange(index, 'degree', e.target.value)} style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} />
                                            <input placeholder="Year" value={edu.year} onChange={e => handleEducationChange(index, 'year', e.target.value)} style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'white' }} />
                                            {formData.education.length > 1 && <button type="button" onClick={() => removeEducation(index)} style={{ color: '#ff4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>}
                                        </div>
                                    ))}
                                    {formData.education.length < 4 && (
                                        <button type="button" onClick={addEducation} style={{ color: 'var(--accent-blue)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>+ Add Education</button>
                                    )}
                                </div>

                                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Update Documents</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Photo</p>
                                            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} style={{ color: 'white', fontSize: '0.8rem' }} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.8rem', marginBottom: '0.3rem' }}>Resume</p>
                                            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'resume')} style={{ color: 'white', fontSize: '0.8rem' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                    <button type="submit" disabled={loading} style={{ background: 'var(--accent-blue)', opacity: loading ? 0.7 : 1, border: 'none', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', color: 'black', fontWeight: 'bold' }}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid var(--text-secondary)', padding: '0.6rem 1.5rem', borderRadius: '4px', cursor: 'pointer', color: 'white' }}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Display Education Section when not editing */}
                {!isEditing && user?.education && user.education.length > 0 && (
                    <div style={{ paddingLeft: 'calc(120px + 2rem)' }}>
                        <h4 style={{ color: 'white', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Education</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {user.education.map((edu, index) => (
                                <div key={index} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                                    <h5 style={{ color: 'white', fontSize: '1rem' }}>{edu.institution}</h5>
                                    <p style={{ color: 'var(--accent-blue)', fontSize: '0.9rem' }}>{edu.degree}</p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{edu.year}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <GravityCard delay={0.1}>
                {/* Reuse existing settings card */}
                <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>General Settings</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', alignItems: 'center' }}>
                    <span>Dark Mode</span>
                    <div style={{ width: '40px', height: '20px', background: 'var(--accent-blue)', borderRadius: '10px', position: 'relative' }}>
                        <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                    </div>
                </div>
            </GravityCard>
        </div>
    );
};

export default Profile;
