const mongoose = require('mongoose');

const wordactionlikeSchema = mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    user_id_like: {
        type: mongoose.Schema.Types.ObjectId,
        require: false,
    }
}); 

const WordActionLike = mongoose.model("wordactionlike", wordactionlikeSchema);
module.exports = WordActionLike;