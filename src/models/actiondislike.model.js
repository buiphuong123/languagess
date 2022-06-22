const mongoose = require('mongoose');

const actiondislikeSchema = mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    user_id_dislike: {
        type: mongoose.Schema.Types.ObjectId,
        require: false,
    }
}); 

const Actiondislike = mongoose.model("actiondislike", actiondislikeSchema);
module.exports = Actiondislike;