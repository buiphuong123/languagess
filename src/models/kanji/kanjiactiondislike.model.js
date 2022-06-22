const mongoose = require('mongoose');

const kanjiactiondislikeSchema = mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    user_id_dislike: {
        type: mongoose.Schema.Types.ObjectId,
        require: false,
    }
}); 

const KanjiActionDislike = mongoose.model("kanjiactiondislike", kanjiactiondislikeSchema);
module.exports = KanjiActionDislike;