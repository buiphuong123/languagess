const mongoose = require('mongoose');

const vocabularySchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    data: {
        type: Array,
        require: false,
    },
    typeShare: { // 0: private, 1: all, 2 : group
        type: Number,
        require: false,
    },
    share: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    ]
    ,
    remind: {
        type: String,
        require: false,
    },
    date: {
        type: Date,
        require: true,
    }
  
}); 

const Vocabulary = mongoose.model("vocabulary", vocabularySchema);
module.exports = Vocabulary;