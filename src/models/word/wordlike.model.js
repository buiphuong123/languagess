const mongoose = require('mongoose');

const WordLikeSchema = mongoose.Schema({
    userId: {
        type: String,
        ref: "user"
    },
    wordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'word',
    },
    isLike: {
        type: Boolean,
        default: true,
    },
}); 

const WordLike = mongoose.model("wordlike", WordLikeSchema);
module.exports = WordLike;