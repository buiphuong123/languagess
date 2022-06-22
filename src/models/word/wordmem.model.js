const mongoose = require('mongoose');

const WordMemSchema = mongoose.Schema({
    userId: {
        type: String,
        ref: "user"
    },
    
    wordId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "word",
    },
    isMemerize: {
        type: Boolean,
        default: true,
    },
}); 

const WordMem = mongoose.model("wordmem", WordMemSchema);
module.exports = WordMem; 