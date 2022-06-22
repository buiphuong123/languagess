const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
    },
    content: {
        type: String,
        require: true,
    },
    time: {
        type: Date,
        require: true
    },
    action: {
        type: String,
        require: false
    },
    data: {
        type: Object,
        require: true,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    typeNoti: {
        type: String,
        require: true
    }
}); 

const Notification = mongoose.model("notification", notificationSchema);
module.exports = Notification;