const mongoose = require('mongoose');

const wordexampleSchema = mongoose.Schema({
    word_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    jp: {
        type: Array,
        require: true,
    },
    vn: {
        type: String,
        require: true,
    }
}); 

const WordExample = mongoose.model("wordexample", wordexampleSchema);
module.exports = WordExample;