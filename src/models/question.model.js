const mongoose = require('mongoose');

const questionSchema = mongoose.Schema({
    question: {
        type: String,
        require: true,
    },
    listAns: {
        type: Array,
        require: true,
    },
    answer: {
        type: Number,
        require: true,
    },
    explain: {
        type: String,
        require: false,
    },
    level: {
        type: Number,
        require: true
    },
    lession: {
        type: Number,
        require: true,
    },
    data: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "grammar",
    }

}); 

const Question = mongoose.model("question", questionSchema);
module.exports = Question;