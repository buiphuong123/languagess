const mongoose = require('mongoose');

const KanjiLikeSchema = mongoose.Schema({
    userId: {
        type: String,
        ref: "user"
    },
    kanjiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'kanji',
    },
    islike: {
        type: Boolean,
        default: true,
    },
}); 

const KanjiLike = mongoose.model("kanjilike", KanjiLikeSchema);
module.exports = KanjiLike;