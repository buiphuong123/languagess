const mongoose = require('mongoose');

const wordSchema = mongoose.Schema({
    word: {
        type: String,
        require: true,
    },
    translate: {
        type: String,
        require: true,
    },
    vn: {
        type: String,
        require: true,
    },
    means: {
        type: Array,
        require: false,
    },
    kind : {
        type: Array,
        require: false
    },
    amhan: {
        type: String, 
        require: false,
    },
    level: { // 5,4,3,2
        type: Number,
        require: true,
    },
    images: {
        type: Array,
        require: false,
    },
    lession: {
        type: Number,
        require: false,
    }
}); 

const Word = mongoose.model("word", wordSchema);
module.exports = Word;