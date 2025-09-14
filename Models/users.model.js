import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        minLength: 5,
        maxlength: 30,
        lowercase: true,

    },
    password: {
        type: String,
        required: true,
        minlength: 5,
    }

}, { timestamps: true });

export default mongoose.model('User', userSchema);