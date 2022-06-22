const mongoose = require('mongoose');

const resultgrammarSchema = mongoose.Schema({
    grammar_id: {
        type: String,
        require: true,
    },
    user_id: {
        type: String,
        require: true,
    },
    question_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questiongrammar",
    },
    isTrue: {
        type: Boolean,
        require: true,
    },
    chooseAns: {
        type: String,
        require: true
    }
}); 

const ResultGrammar = mongoose.model("resultgrammar", resultgrammarSchema);
module.exports = ResultGrammar;