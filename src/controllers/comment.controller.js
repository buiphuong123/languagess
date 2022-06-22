const Comment = require('../models/comment.model.js');
const ActionLike = require('../models/actionlike.model');
const ActionDisLike = require('../models/actiondislike.model');
const socket = require('../../index');
const User = require('../models/user.model.js');
const Grammar = require('../models/grammar.model.js');

const test = async(req, res) => {
    var last = new Date();
    const comment = await Comment.find();
    console.log(comment[0].time);
    const result = (last.getTime() - comment[0].time.getTime())/1000;
    const minutes = (result-result%60)/60;
    const hours = (minutes-minutes%60)/60;
    const day = (result-result%86400)/86400;
    const month = (day-day%30)/30;
    const year = (month-month%12)/12;
return res.json({minutes, hours, day, month, year});
}

// const sendToAll = async

const getComment = async(req, res) => {
    const {grammar_id, user_id} = req.body;
    console.log('dau vao', grammar_id, user_id);
    const comment = await Comment.find({grammar_id: grammar_id}).populate("user_id");
    var i;
    for (i=0; i< comment.length; i++) {
        const likee = await ActionLike.findOne({comment_id: comment[i]._id, user_id_like: user_id});
        if(likee){
            comment[i].islike = true;
        }
        else{
            comment[i].islike = false;
        }
        const account = await ActionLike.find({comment_id: comment[i]._id});
        comment[i].like = account.length;
        const dislikee = await ActionDisLike.findOne({comment_id: comment[i]._id, user_id_dislike: user_id});
        if(dislikee){
            comment[i].isdislike = true;
        }
        else{
            comment[i].isdislike = false;
        }
        const account1 = await ActionDisLike.find({comment_id: comment[i]._id});
        comment[i].dislike = account1.length;
        comment[i].save();
    }
    comment.sort((a, b) => (a.like < b.like) ? 1 : -1);
    return res.json({code: 1, comment: comment});
}

const createComment = async (req, res) => {
    console.log('vao create comment day nhe');
    const { grammar_id, user_id, content, requ } = req.body;
    var today = new Date();
    // const user = await User.findOne({_id: user_id});
    // var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const newComment = new Comment({ grammar_id, user_id: user_id, content, time: today, review: requ});
    console.log('NEW COMMENT' , newComment);
    // socket.socket.emit("SEVER-SEND-NEWCOMMENT", {
    //     comment: newComment,
    //     username: user.username
    // });
    await newComment.save(function (error, newComment) {
        if (error) {
            return res.json({ code: 0, error: error });
        }
        else {
            return res.json({ code: 1, success: "Comment của bạn đợi quản trị viên xét duyệt ", comment: newComment });
        }
    })
}

const createLikeComment = async (req, res) => {
    const { comment_id, user_id_like, checkStatus } = req.body;
    const check = await ActionLike.findOne({ comment_id, user_id_like });
    ActionDisLike.findOneAndRemove({  comment_id, user_id_dislike: user_id_like }, function (err) {
        if (err) {
            console.log(err);
            return res.json({ message: 'remove err' });
        }
        else {
            if(check) {
                ActionLike.findOneAndRemove({ comment_id, user_id_like}, function(err) {
                    // socket.socket.emit("SEVER-SEND-LIKE", {
                    //     comment_id: comment_id,
                    //     islike: true,
                    //     isdislike: checkStatus,
                    // });
                    return res.json('not like success');
                })
            }
            
            else {
                const newAction = new ActionLike({ comment_id, user_id_like });
             newAction.save(function (error, newAction) {
                if (error) {
                    return res.json({ code: 0, error: "network error" });
                }
                else {
                    
                        // socket.socket.emit("SEVER-SEND-LIKE", {
                        //     comment_id: comment_id,
                        //     islike: false,
                        //     isdislike: checkStatus,
                        // });
                        return res.json({ code: 1, success: "action success", action: newAction });
                    
                }
            })
            }
            
        }

    });
}

const countLike = async(req, res) => {
    const {comment_id} = req.body;
    const account = await ActionLike.find({comment_id});
    return res.json(account.length);
}

const countDisLike = async(req, res) => {
    const {comment_id} = req.body;
    const account = await ActionDisLike.find({comment_id});
    return res.json(account.length);
}

const createDisLikeComment = async (req, res) => {
    const { comment_id, user_id_dislike, checkStatus } = req.body;
    const check = await ActionDisLike.findOne({ comment_id, user_id_dislike });
    ActionLike.findOneAndRemove({  comment_id, user_id_like: user_id_dislike }, function (err) {
        if (err) {
            console.log(err);
            return res.json({ message: 'remove err' });
        }
        else {
            if(check) {
                // ActionDisLike.findOneAndRemove({ comment_id, user_id_dislike}, function(err) {
                //     socket.socket.emit("SEVER-SEND-DISLIKE", {
                //         comment_id: comment_id,
                //         isdislike: true,
                //         islike: checkStatus,
                //     });
                    return res.json('not dislike success');
                // })
            }

            else {
                const newAction = new ActionDisLike({ comment_id, user_id_dislike });
             newAction.save(function (error, newAction) {
                if (error) {
                    return res.json({ code: 0, error: "loix xay ra, vui long th lai" });
                }
                else {
                        // socket.socket.emit("SEVER-SEND-DISLIKE", {
                        //     comment_id: comment_id,
                        //     isdislike: false,
                        //     islike: checkStatus
                        // });
                        return res.json({ code: 1, success: "action success", action: newAction });
                    
                    
                }
            })
            }
        }

    });
}

const userRequest = async (req, res) => { // tim các comment chưa duyệt 
    const comment = await Comment.find({ review: "not approved" });
    return res.json({ content: comment });
}

const browseComment = async (req, res) => {
    const { user_id, review, people_review, reason, grammar_id, time } = req.body;
    const browse_comment = await Comment.findOne({ user_id, grammar_id, time });
    var today = new Date();
    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    browse_comment.review = review;
    browse_comment.people_review = people_review;
    browse_comment.reason = reason;
    browse_comment.time_review = date;
    await browse_comment.save(function (error, browse_comment) {
        if (error) {
            return res.json({ code: 0, error: "looi xay ra. Vui lòng thử lại" });
        }
        else {
            return res.json({ code: 1, success: "thanh cong", browse_comment });
        }
    })

}

counnt_action = async (req, res) => {
    const { comment_id } = req.body;

}
const testComment = async(req, res) => {
    const comment = await Comment.find();
    for (var i=0;i< comment.length; i++) {
        comment[i].review = 2;
        await comment[i].save();
        console.log('save success');
    }
}

const getAllGrammarComment = async(req, res) => {
    const comment = await Comment.find().populate("user_id").populate("grammar_id");
    console.log(comment);
    return res.json({comment: comment});
}
module.exports = {
    createComment,
    createLikeComment,
    createDisLikeComment,
    userRequest,
    browseComment,
    getComment,
    countLike, 
    countDisLike,
    test,
    testComment,
    getAllGrammarComment
};