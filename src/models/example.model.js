const mongoose = require('mongoose');

const exampleSchema = mongoose.Schema({
    grammar_id: {
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

const Example = mongoose.model("example", exampleSchema);
module.exports = Example;