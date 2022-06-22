const mongoose = require('mongoose');

const grammarSchema = mongoose.Schema({
    level: {
        type: Number,
        require: true,
    },
    lession: {
        type: Number,
        require: false,
    },
    grammar: {
        type: String,
        require: true,
    },
    uses : {
        type: Array,
        require: true,
    }
    
}); 

const Grammar = mongoose.model("grammar", grammarSchema);
module.exports = Grammar;