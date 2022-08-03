const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
    user_id: {
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
    dataWord: {
        type: mongoose.Schema.Types.ObjectId,
       ref: "word"
    },
    dataGrammar: {
        type: mongoose.Schema.Types.ObjectId,
       ref: "grammar"
    },
    dataKanji: {
        type: mongoose.Schema.Types.ObjectId,
       ref: "kanji"
    },
    dataPost: {
        type: mongoose.Schema.Types.ObjectId,
       ref: "post"
    },
    dataVocu: {
        type: mongoose.Schema.Types.ObjectId,
       ref: "vocabulary"
    },
    dataRemind: {
        type: mongoose.Schema.Types.ObjectId,
       ref: "schedule"
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    typeNoti: {
        type: String,
        require: true
    },
    user_friends: {
       type: mongoose.Schema.Types.ObjectId,
       ref: "user"
    }
}); 

const Notification = mongoose.model("notification", notificationSchema);
module.exports = Notification;