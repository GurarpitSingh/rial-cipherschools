const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String
    },
    lastName: {
        type: String
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
    },
    dob: {
        type: Date,
        required: true,
    },
    about: {
        type: String,
    },
    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
        }
    },
    linkedin: {
        type: String,
    },
    github: {
        type: String,
    },
    twitter: {
        type: String,
    },
    instagram: {
        type: String,
    },
    facebook: {
        type: String,
    },
    website: {
        type: String,
    },
    highestEducation: {
        type: String,
    },
    job: {
        type: String,
    },
    interests: {
        type: Array,
        
    },
    })

const User = mongoose.model('User', userSchema);

module.exports = User;