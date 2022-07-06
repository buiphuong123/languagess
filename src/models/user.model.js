const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    token: {
        type: String,
        require: true,
    },
    notifiToken: {
        type: String,
        require: false,
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    resetPasswordToken: {
        type: String, 
        require: false,
    },
    resetPasswordExpires: {
        type: Date,
        require: false,
    },
    role: {
        type: Number, 
        require: false
    },
    level: {
        type: String,
        require: false,
    },
    hobby: {
        type: String,
        require: false,
    },
    avatar: {
        type: String,
        default: "https://secure.gravatar.com/avatar/7d3e8b37851acf4d275b605453b5b1a9?s=256&d=mm&r=g",
    }
}); 

const User = mongoose.model("user", userSchema);
module.exports = User;