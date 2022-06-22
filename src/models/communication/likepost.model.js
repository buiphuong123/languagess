const mongoose = require('mongoose');

const likepostSchema = mongoose.Schema({
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "post",
    },
    userId: {
        type: String,
        ref: "user",
    }
}); 

const LikePost = mongoose.model("likepost", likepostSchema);
module.exports = LikePost;