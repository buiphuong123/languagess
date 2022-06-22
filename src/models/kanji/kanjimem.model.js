const mongoose = require('mongoose');

const KanjiMemSchema = mongoose.Schema({
    userId: {
        type: String,
        ref: "user"
    },
    kanjiId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'kanji',
    },
    isMemerize: {
        type: Boolean,
        default: true,
    },
}); 

const KanjiMem = mongoose.model("kanjimem", KanjiMemSchema);
module.exports = KanjiMem;