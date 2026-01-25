const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    resume: {
        type: String, // Base64 or URL
        default: ''
    },
    photo: {
        type: String, // Base64 or URL
        default: ''
    },
    mobile: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    education: {
        type: [Object],
        default: []
    },
    rolesSuited: {
        type: [String],
        default: ['General Application']
    },
    jobsApplied: {
        type: Number,
        default: 0
    },
    experienceLevel: {
        type: String,
        default: 'Not Analyzed'
    },
    jobMatches: [{
        title: String,
        company: String,
        link: String,
        level: String
    }],
    applications: [{
        role: String,
        company: String,
        status: String,
        date: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetOTP: {
        type: String,
        default: null
    },
    resetOTPExpire: {
        type: Date,
        default: null
    },
    linkedinEmail: {
        type: String,
        default: ''
    },
    linkedinPassword: {
        type: String, // Encrypted
        default: ''
    },
    dailyJobsAppliedCount: {
        type: Number,
        default: 0
    },
    lastAutomationRun: {
        type: Date,
        default: null
    },
    preferredRole: {
        type: String,
        default: ''
    },
    preferredLocation: {
        type: String,
        default: ''
    },
    preferredExperience: {
        type: String,
        default: ''
    },
    acceptedCount: {
        type: Number,
        default: 0
    },
    rejectedCount: {
        type: Number,
        default: 0
    },
    internships: {
        type: [Object],
        default: []
    },
    achievements: {
        type: [String],
        default: []
    }
});

// Hash password before saving
// Removed 'next' parameter and used async/await directly which Mongoose supports
UserSchema.pre('save', async function () {
    console.log('Hashing password for user:', this.email);
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
