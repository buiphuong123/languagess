const mongoose = require('mongoose');

const wordcommentSchema = mongoose.Schema({
    word_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "word"
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    content: {
        type: String,
        require: true,
    },
    time: {
        type: Date,
        require: true,
    },
    review: {
        type: Number, // refuse(từ chối), accept(chấp nhận), not approved(chưa duyệt)
        require: true,
    }, 
    time_review: {
        type: Date,
        require: false,
    },
    people_review: {
        type: String,
        require: false,
    },
    reason: {
        type: String,
        require: false,
    },
    like: {
        type: Number,
        require: false,
    },
    dislike: {
        type: Number,
        require: false,
    },
    islike: {
        type: Boolean,
        require: false,
    },
    isdislike: {
        type: Boolean,
        require: false,
    }
}); 

const WordComment = mongoose.model("wordcomment", wordcommentSchema);
module.exports = WordComment;