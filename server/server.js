require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());

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

// Register
app.post('/api/register', async (req, res) => {
    const { name, email, password, resume, photo, mobile, address, skills, education } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = new User({
            name,
            email,
            password,
            resume: resume || '',
            photo: photo || '',
            mobile: mobile || '',
            address: address || '',
            skills: skills || [],
            education: education || [],
            rolesSuited: ['Frontend Developer', 'Full Stack Engineer'], // Mocking AI analysis for now
            jobsApplied: 0
        });

        await user.save();

        res.status(201).json({
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
            message: 'User registered successfully'
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
            message: 'Logged in successfully'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update Profile
app.post('/api/update-profile', async (req, res) => {
    const { email, resume, photo, mobile, address, skills, education } = req.body;

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
                jobsApplied: user.jobsApplied
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
            1. A list of technical and soft skills.
            2. 3 actionable improvements.
            3. Experience level (e.g., Intern, Entry Level, Junior, Senior, Lead).
            4. Roles suited (list of titles).
            5. Recommended LinkedIn Job Search Links (5-10 matches). 
               Each match should have: title, company (or "Top Companies"), level, and a realistic LinkedIn search link.
            
            Return the response in this JSON format strictly:
            {
                "skills": ["Skill1", ...],
                "improvements": ["Point 1", ...],
                "experienceLevel": "Entry Level",
                "rolesSuited": ["Frontend Developer", ...],
                "jobMatches": [
                    {"title": "Role Title", "company": "Company Name", "level": "Junior", "link": "https://www.linkedin.com/jobs/search/?keywords=..." },
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
        const jsonResponse = JSON.parse(responseText.replace(/```json|```/g, '').trim());

        // Update user in database
        if (jsonResponse.skills) user.skills = jsonResponse.skills;
        if (jsonResponse.experienceLevel) user.experienceLevel = jsonResponse.experienceLevel;
        if (jsonResponse.rolesSuited) user.rolesSuited = jsonResponse.rolesSuited;
        if (jsonResponse.jobMatches) user.jobMatches = jsonResponse.jobMatches;

        await user.save();

        res.json({
            ...jsonResponse,
            message: 'Resume analyzed and job matches generated successfully'
        });

    } catch (err) {
        console.error("AI Analysis Error:", err);
        res.status(500).json({ message: 'Failed to analyze resume', error: err.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}. Ensure MongoDB URI is set in .env`));
