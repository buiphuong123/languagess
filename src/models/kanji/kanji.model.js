const mongoose = require('mongoose');

const kanjiSchema = mongoose.Schema({
    kanji: {
        type: String,
        require: true,
    },
    level: {
        type: String,
        require: true,
    },
    mean: {
        type: String,
        require: true,
    },
    kanji_on: {
        type: Array,
        require: false,
    },
    kanji_kun : {
        type: Array,
        require: false
    },
    explain: {
        type: String, 
        require: false,
    },
    image: { // 5,4,3,2
        type: String,
        require: false,
    },
    example_kun: {
        type: Object,
        require: false,
    },
    example_on: {
        type: Object,
        require: false,
    },
    detail: {
        type: String,
        require: false
    },
    compDetail: {
        type: Array,
        require: false
    },
    lession: {
        type: Number,
        require: false
    }
}); 

const Kanji = mongoose.model("kanji", kanjiSchema);
module.exports = Kanji;