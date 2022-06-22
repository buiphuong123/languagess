const mongoose = require('mongoose');

const wordactiondislikeSchema = mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    user_id_dislike: {
        type: mongoose.Schema.Types.ObjectId,
        require: false,
    }
}); 

const WordActionDisLike = mongoose.model("wordactiondislike", wordactiondislikeSchema);
module.exports = WordActionDisLike;