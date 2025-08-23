import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    zipCode: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    qualification: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    expertAt: {
        type: String,
        required: true,
        trim: true
    },
    appliedFor: {
        type: String,
        enum: ['IELTS', 'English', 'Quran'],
        required: true
    },
    whyFitForJob: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Teacher', teacherSchema); 