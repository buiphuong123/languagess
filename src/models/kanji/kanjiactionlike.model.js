const mongoose = require('mongoose');

const kanjiactionlikeSchema = mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    user_id_like: {
        type: mongoose.Schema.Types.ObjectId,
        require: false,
    }
}); 

const KanjiActionlike = mongoose.model("kanjiactionlike", kanjiactionlikeSchema);
module.exports = KanjiActionlike;