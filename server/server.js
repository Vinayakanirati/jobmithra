require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { encrypt, decrypt } = require('./utils/encryption');
const { spawn } = require('child_process');

const app = express();

// Nodemailer transporter (using vinayakanirati@gmail.com)
// Note: User prompt mentions vinayakanirati@gmail.com
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'vinayakanirati@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());

// Serve static files from the React app dist folder
app.use(express.static(path.join(__dirname, '../dist')));

// Connect to MongoDB
// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
const uri = process.env.MONGO_URI;
if (!uri) {
    console.error('ERROR: MONGO_URI is not defined in .env');
} else {
    console.log('URI found (masked):', uri.replace(/:([^:@]+)@/, ':****@'));
}

mongoose.connect(uri)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => {
        console.error('MongoDB Connection Failed:');
        console.error('Error Name:', err.name);
        console.error('Error Message:', err.message);
        if (err.message.includes('Authentication failed')) {
            console.error('HINT: Check your username and password. If your password has special characters like @, :, or #, they must be URL encoded (e.g., @ -> %40).');
        }
    });

// Routes

// Register Init (Send OTP)
app.post('/api/register-init', async (req, res) => {
    const { name, email, password, mobile, address, skills, education } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({ message: 'User already exists and is verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

        if (!user) {
            user = new User({
                name,
                email,
                password,
                mobile: mobile || '',
                address: address || '',
                skills: skills || [],
                education: education || [],
                verificationOTP: otp,
                verificationOTPExpire: otpExpire,
                isVerified: false
            });
        } else {
            // Update existing unverified user
            user.name = name;
            user.password = password;
            user.mobile = mobile || user.mobile;
            user.address = address || user.address;
            user.skills = skills || user.skills;
            user.education = education || user.education;
            user.verificationOTP = otp;
            user.verificationOTPExpire = otpExpire;
        }

        await user.save();

        const mailOptions = {
            from: 'vinayakanirati@gmail.com',
            to: email,
            subject: 'JobMithra Registration OTP',
            text: `Welcome to JobMithra, ${name}!\n\nYour 6-digit verification code is: ${otp}\n\nThis code is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error('Email error:', error);
                return res.status(500).json({ message: 'Error sending verification email' });
            }
            res.json({ message: 'Verification OTP sent to your email.' });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Register Verify
app.post('/api/register-verify', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({
            email,
            verificationOTP: otp,
            verificationOTPExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.verificationOTP = null;
        user.verificationOTPExpire = null;
        user.rolesSuited = ['Frontend Developer', 'Full Stack Engineer']; // Initial mock
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            resume: user.resume,
            photo: user.photo,
            mobile: user.mobile,
            address: user.address,
            skills: user.skills,
            education: user.education,
            rolesSuited: user.rolesSuited,
            jobsApplied: user.jobsApplied,
            preferredRole: user.preferredRole,
            preferredLocation: user.preferredLocation,
            preferredExperience: user.preferredExperience,
            linkedinEmail: user.linkedinEmail,
            dailyJobsAppliedCount: user.dailyJobsAppliedCount,
            acceptedCount: user.acceptedCount,
            rejectedCount: user.rejectedCount,
            message: 'Email verified and registration complete!'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Account not verified. Please verify your email.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            resume: user.resume,
            photo: user.photo,
            mobile: user.mobile,
            address: user.address,
            skills: user.skills,
            education: user.education,
            rolesSuited: user.rolesSuited,
            jobsApplied: user.jobsApplied,
            preferredRole: user.preferredRole,
            preferredLocation: user.preferredLocation,
            preferredExperience: user.preferredExperience,
            linkedinEmail: user.linkedinEmail,
            dailyJobsAppliedCount: user.dailyJobsAppliedCount,
            acceptedCount: user.acceptedCount,
            rejectedCount: user.rejectedCount,
            message: 'Logged in successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Forgot Password - Send OTP
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOTP = otp;
        user.resetOTPExpire = Date.now() + 3 * 60 * 1000; // 3 minutes
        await user.save();

        const mailOptions = {
            from: 'vinayakanirati@gmail.com',
            to: email,
            subject: 'jobmithra reset password',
            text: `Your OTP for password reset is: ${otp}. It is valid for 3 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email error:', error);
                return res.status(500).json({ message: 'Error sending email' });
            }
            res.json({ message: 'OTP sent to email' });
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Verify OTP & Reset Password
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    try {
        const user = await User.findOne({
            email,
            resetOTP: otp,
            resetOTPExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        user.password = newPassword;
        user.resetOTP = null;
        user.resetOTPExpire = null;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update Profile
app.post('/api/update-profile', async (req, res) => {
    const { email, resume, photo, mobile, address, skills, education, linkedinEmail, linkedinPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (resume !== undefined) user.resume = resume;
        if (photo !== undefined) user.photo = photo;
        if (mobile !== undefined) user.mobile = mobile;
        if (address !== undefined) user.address = address;
        if (skills !== undefined) user.skills = skills;
        if (education !== undefined) user.education = education;
        if (linkedinEmail !== undefined) user.linkedinEmail = linkedinEmail;
        if (linkedinPassword !== undefined && linkedinPassword !== '') {
            user.linkedinPassword = encrypt(linkedinPassword);
        }

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                resume: user.resume,
                photo: user.photo,
                mobile: user.mobile,
                address: user.address,
                skills: user.skills,
                education: user.education,
                rolesSuited: user.rolesSuited,
                jobsApplied: user.jobsApplied,
                linkedinEmail: user.linkedinEmail,
                dailyJobsAppliedCount: user.dailyJobsAppliedCount,
                acceptedCount: user.acceptedCount,
                rejectedCount: user.rejectedCount,
                internships: user.internships,
                achievements: user.achievements
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Resume Analysis
app.post('/api/analyze-resume', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user || (!user.resume && !req.body.resumeContent)) {
            return res.status(400).json({ message: 'User or resume not found' });
        }

        // Use stored resume or one passed in body (if testing)
        // Resume is expected to be a Base64 string (data:application/pdf;base64,...)
        const resumeData = req.body.resumeContent || user.resume;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });


        // Extract base64 part
        const base64Data = resumeData.split(',')[1];
        const mimeType = resumeData.split(';')[0].split(':')[1];

        const prompt = `
            Analyze this resume and provide:
            1. Full Name of the candidate.
            2. Email and Contact Phone Number (if present).
            3. A list of technical and soft skills.
            4. 3 actionable improvements.
            5. Experience level (e.g., Intern, Entry Level, Junior, Senior, Lead).
            6. A list of internships (company, role, duration).
            7. Key achievements and certifications.
            8. Roles suited (list of titles).
            9. Recommended LinkedIn "EASY APPLY" Job Search Links (5-10 matches). 
               Each match MUST include the parameter "&f_AL=true" in the link to filter for Easy Apply jobs. 
               Each match should have: title, company (or "Top Companies"), level, and the link.
            
            Return the response in this JSON format strictly:
            {
                "name": "Full Name",
                "email": "email@example.com",
                "mobile": "1234567890",
                "skills": ["Skill1", ...],
                "improvements": ["Point 1", ...],
                "experienceLevel": "Entry Level",
                "internships": [{"company": "X", "role": "Y", "duration": "Z"}, ...],
                "achievements": ["Cert A", "Won B", ...],
                "rolesSuited": ["Frontend Developer", ...],
                "jobMatches": [
                    {"title": "Role Title", "company": "Company Name", "level": "Junior", "link": "https://www.linkedin.com/jobs/search/?f_AL=true&keywords=...", "matchScore": 85 },
                    ...
                ]
            }
            Do not include markdown formatting like \`\`\`json. Just the raw JSON.
        `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: mimeType
                }
            }
        ]);

        const responseText = result.response.text();
        let jsonResponse;
        try {
            jsonResponse = JSON.parse(responseText.replace(/```json|```/g, '').trim());
        } catch (parseError) {
            console.error("AI Response Parse Error:", parseError, "Raw Text:", responseText);
            return res.status(500).json({ message: 'Failed to parse AI response', error: parseError.message });
        }

        // Update user in database
        if (jsonResponse.name) user.name = jsonResponse.name;
        if (jsonResponse.mobile) user.mobile = jsonResponse.mobile;
        if (jsonResponse.skills) user.skills = jsonResponse.skills;
        if (jsonResponse.experienceLevel) user.experienceLevel = jsonResponse.experienceLevel;
        if (jsonResponse.rolesSuited) user.rolesSuited = jsonResponse.rolesSuited;
        if (jsonResponse.jobMatches) user.jobMatches = jsonResponse.jobMatches;
        if (jsonResponse.internships) user.internships = jsonResponse.internships;
        if (jsonResponse.achievements) user.achievements = jsonResponse.achievements;

        await user.save();

        res.json({
            ...jsonResponse,
            message: 'Resume analyzed and profile updated successfully',
            user: {
                _id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                skills: user.skills,
                experienceLevel: user.experienceLevel,
                rolesSuited: user.rolesSuited,
                jobMatches: user.jobMatches,
                internships: user.internships,
                achievements: user.achievements
            }
        });

    } catch (err) {
        console.error("AI Analysis Error:", err);
        res.status(500).json({ message: 'Failed to analyze resume', error: err.message });
    }
});

// Apply Job
app.post('/api/apply-job', async (req, res) => {
    const { email, jobTitle, company, interviewPrepLink } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.jobsApplied += 1;
        user.applications.push({
            role: jobTitle,
            company: company,
            status: 'Applied',
            date: new Date()
        });
        await user.save();

        const mailOptions = {
            from: 'vinayakanirati@gmail.com',
            to: email,
            subject: `Job Application: ${jobTitle} at ${company}`,
            text: `You have successfully applied for ${jobTitle} at ${company}. 
            \nPrepare for your interview here: ${interviewPrepLink}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.error('Email error:', error);
            res.json({ message: 'Application submitted and email sent', user });
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Save LinkedIn Credentials
app.post('/api/save-linkedin-credentials', async (req, res) => {
    const { email, lEmail, lPassword } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.linkedinEmail = lEmail;
        user.linkedinPassword = encrypt(lPassword);
        await user.save();

        res.json({
            message: 'LinkedIn credentials saved securely',
            user: {
                linkedinEmail: user.linkedinEmail
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Start LinkedIn Auto-Apply
app.post('/api/start-auto-apply', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.linkedinEmail || !user.linkedinPassword) {
            return res.status(400).json({ message: 'LinkedIn credentials not configured.' });
        }

        // Daily Limit Check & Reset logic
        const now = new Date();
        const lastRun = user.lastAutomationRun;
        let dailyCount = user.dailyJobsAppliedCount || 0;

        if (lastRun) {
            const lastRunDate = new Date(lastRun).toDateString();
            const todayDate = now.toDateString();
            if (lastRunDate !== todayDate) {
                dailyCount = 0; // Reset for new day
            }
        }

        if (dailyCount >= 5) {
            return res.status(400).json({ message: 'Daily limit of 5 job applications reached. Please try again tomorrow.' });
        }

        const password = decrypt(user.linkedinPassword);

        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const pythonProcess = spawn(pythonCmd, ['./automation/agent.py']);

        const inputData = JSON.stringify({
            email: user.linkedinEmail,
            password: password,
            profile: {
                name: user.name,
                email: user.email,
                phone: user.mobile,
                skills: user.skills,
                experienceLevel: user.experienceLevel,
                education: user.education,
                rolesSuited: user.rolesSuited,
                preferredRole: user.preferredRole,
                preferredLocation: user.preferredLocation,
                preferredExperience: user.preferredExperience
            },
            jobMatches: user.jobMatches || [],
            dailyLimitRemaining: 5 - dailyCount
        });

        pythonProcess.stdin.on('error', (err) => {
            console.error('Stdin error:', err);
        });

        if (pythonProcess.stdin.writable) {
            pythonProcess.stdin.write(inputData);
            pythonProcess.stdin.end();
        }

        let output = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Error: ${data}`);
        });

        pythonProcess.on('close', async (code) => {
            console.log(`Python process exited with code ${code}`);
            try {
                // Improved JSON parsing: find the last JSON block in the output
                const jsonMatch = output.match(/\{[\s\S]*\}/g);
                if (!jsonMatch) {
                    throw new Error("No valid JSON found in automation output.");
                }
                const resultData = JSON.parse(jsonMatch[jsonMatch.length - 1]);

                if (resultData.error) {
                    return res.status(500).json({ message: `Automation Error: ${resultData.error}` });
                }

                if (resultData.results) {
                    const appliedCount = resultData.results.filter(r => r.status === 'Applied').length;

                    // Update user stats
                    user.dailyJobsAppliedCount = dailyCount + appliedCount;
                    user.jobsApplied += appliedCount;
                    user.lastAutomationRun = now;

                    // Log to user.applications
                    resultData.results.forEach(r => {
                        if (r.status === 'Applied') {
                            user.applications.push({
                                role: r.title,
                                company: r.company || 'Unknown',
                                status: 'Applied',
                                date: new Date()
                            });
                        }
                    });

                    await user.save();

                    const resultsText = resultData.results.map(r => `- ${r.title} at ${r.company}: ${r.status}`).join('\n');
                    const mailOptions = {
                        from: 'vinayakanirati@gmail.com',
                        to: user.email,
                        subject: 'JobMithra: Daily Job Application Summary',
                        text: `LinkedIn automation completed for today.\n\nApplications Today: ${appliedCount}\nDaily Remaining: ${5 - user.dailyJobsAppliedCount}\n\nSummary:\n${resultsText}\n\nPrepare for interviews: http://localhost:5173/?tab=interview`
                    };

                    transporter.sendMail(mailOptions, (error) => {
                        if (error) console.error('Email error:', error);
                    });

                    return res.json({
                        message: `Automation finished. Applied to ${appliedCount} jobs.`,
                        results: resultData.results,
                        dailyCount: user.dailyJobsAppliedCount,
                        user: user // Send full user back
                    });
                }

                res.status(500).json({ message: 'Automation finished but returned no results.' });
            } catch (e) {
                res.status(500).json({ message: 'Automation process closed with invalid response.' });
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Save Job Preferences
app.post('/api/save-preferences', async (req, res) => {
    const { email, role, location, experience } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.preferredRole = role;
        user.preferredLocation = location;
        user.preferredExperience = experience;
        await user.save();

        res.json({
            message: 'Preferences saved successfully',
            user: {
                preferredRole: user.preferredRole,
                preferredLocation: user.preferredLocation,
                preferredExperience: user.preferredExperience
            }
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Start Single LinkedIn Apply
app.post('/api/start-single-apply', async (req, res) => {
    const { email, job } = req.body; // job: { title, company, link }
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.linkedinEmail || !user.linkedinPassword) {
            return res.status(400).json({ message: 'LinkedIn credentials not configured.' });
        }

        const password = decrypt(user.linkedinPassword);
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const pythonProcess = spawn(pythonCmd, ['./automation/agent.py']);

        const inputData = JSON.stringify({
            email: user.linkedinEmail,
            password: password,
            profile: {
                name: user.name,
                email: user.email,
                phone: user.mobile,
                skills: user.skills,
                experienceLevel: user.experienceLevel,
                education: user.education,
                rolesSuited: user.rolesSuited,
                preferredRole: user.preferredRole,
                preferredLocation: user.preferredLocation,
                preferredExperience: user.preferredExperience
            },
            jobMatches: [job], // Just the single job
            dailyLimitRemaining: 1 // Allow at least one for manual trigger
        });

        pythonProcess.stdin.write(inputData);
        pythonProcess.stdin.end();

        let output = '';
        pythonProcess.stdout.on('data', (data) => output += data.toString());
        pythonProcess.stderr.on('data', (data) => console.error(`Python Error: ${data}`));

        pythonProcess.on('close', async (code) => {
            try {
                const jsonMatch = output.match(/\{[\s\S]*\}/g);
                if (!jsonMatch) {
                    throw new Error("No valid JSON found in automation output.");
                }
                const resultData = JSON.parse(jsonMatch[jsonMatch.length - 1]);

                if (resultData.results && Array.isArray(resultData.results) && resultData.results.length > 0) {
                    const firstResult = resultData.results[0];
                    if (firstResult.status === 'Applied') {
                        user.jobsApplied += 1;
                        user.dailyJobsAppliedCount = (user.dailyJobsAppliedCount || 0) + 1;
                        user.applications.push({
                            role: job.title,
                            company: job.company,
                            status: 'Applied',
                            date: new Date()
                        });
                        await user.save();

                        // SEND EMAIL FOR SINGLE APPLY
                        const mailOptions = {
                            from: 'vinayakanirati@gmail.com',
                            to: user.email,
                            subject: `JobMithra: Application Sent to ${job.company}`,
                            text: `Success! Our agent just applied to the ${job.title} role at ${job.company} for you.\n\nYou can track this and other applications in your JobMithra dashboard.`
                        };
                        transporter.sendMail(mailOptions, (error) => {
                            if (error) console.error('Email error:', error);
                        });
                    }
                }
                res.json({ ...resultData, user: user });
            } catch (e) {
                console.error('Frontend Parse Error:', e, 'Raw Output:', output);
                res.status(500).json({ message: 'Automation finished with unexpected output structure.', error: e.message });
            }
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Final catch-all route to serve the frontend (for React routing)
// Using app.use() without a path matches all remaining requests, 
// bypassing Express 5 path-to-regexp parsing issues.
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}. Ensure MongoDB URI is set in .env`));
