const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    grammar_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "grammar",
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
        type: Number, // 0 refuse(từ chối),1  accept(chấp nhận), 2 not approved(chưa duyệt)
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

const Comment = mongoose.model("comment", commentSchema);
module.exports = Comment;