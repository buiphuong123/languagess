const mongoose = require('mongoose');

const actionlikeSchema = mongoose.Schema({
    comment_id: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
    },
    user_id_like: {
        type: mongoose.Schema.Types.ObjectId,
        require: false,
    }
}); 

const Actionlike = mongoose.model("actionlike", actionlikeSchema);
module.exports = Actionlike;