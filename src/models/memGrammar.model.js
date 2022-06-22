const mongoose = require('mongoose');

const memGrammarSchema = mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    grammar_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "grammar",
    },
    isMem: {
        type: Boolean,
        default: true,
    },

}); 

const MemGrammar = mongoose.model("memgrammar", memGrammarSchema);
module.exports = MemGrammar;