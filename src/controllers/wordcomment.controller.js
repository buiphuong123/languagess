const WordComment = require('../models/word/wordcomment.model');
const WordActionLike = require('../models/word/wordactionlike.model');
const WordActionDisLike = require('../models/word/wordactiondislike.model');
// const socket = require('../../index');
const User = require('../models/user.model.js');

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
//   return res.json([hours, minutes, result % 60].map(format).join(':'));
    // console.log(result);
    // const now = new Date();
	// const year = now.getFullYear();
	// const month = now.getMonth() + 1;
	// const date = now.getDate();
	// const lastMillisecond =
	// 	new Date(`${month}/${date}/${year}`).getTime() + 24 * 60 * 60 * 1000;
	// const firstMillisecond = lastMillisecond - number * 24 * 60 * 60 * 1000;
    // console.log(firstMillisecond);
}

// const sendToAll = async
const getCommentTest = async(req, res) => {
    const {word_id, user_id} = req.body;
    WordComment.aggregate([
        {
            $lookup: {
                from: "wordactionlikes",
                let: { user: "$$user_id_like", idd: "$$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr:
                            {
                                $and:
                                    [
                                        { $eq: ["$$user_id_like", user_id] },
                                        { $eq: ["$$idd", word_id] }
                                    ]
                            }
                        }
                    },
                    { $project: { islike: true, _id: 0 } }
                ],
                as: "likearr"
            },
        }
    ],  function async(err, data) {
                if (err) {
                    return res.json({ code: 0, errMsg: err });
                } else {
                    return res.json({ data: data });
                  }
            })
}

const getCommentWord = async(req, res) => {
    const {word_id, user_id} = req.body;
    // WordComment.aggregate([
    //     {
    //         $lookup: {
    //             from: "wordactionlikes",
    //             let: { user: "$user_id_like", idd: "$_id" },
    //             pipeline: [
    //                 {
    //                     $match:
    //                     {
    //                         $expr:
    //                         {
    //                             $and:
    //                                 [
    //                                     { $eq: ["$user_id_like", user_id] },
    //                                     { $eq: ["$$idd", "$postId"] }
    //                                 ]
    //                         }
    //                     }
    //                 },
    //                 { $project: { islike: 1, _id: 0 } }
    //             ],
    //             as: "likeposts"
    //         },
    //     }
    // ])
    const comment = await WordComment.find({word_id: word_id}).populate("user_id");
    var i;
    for (i=0; i< comment.length; i++) {
        const likee = await WordActionLike.findOne({comment_id: comment[i]._id, user_id_like: user_id});
        if(likee){
            comment[i].islike = true;
        }
        else{
            comment[i].islike = false;
        }
        const account = await WordActionLike.find({comment_id: comment[i]._id});
        comment[i].like = account.length;
        const dislikee = await WordActionDisLike.findOne({comment_id: comment[i]._id, user_id_dislike: user_id});
        if(dislikee){
            comment[i].isdislike = true;
        }
        else{
            comment[i].isdislike = false;
        }
        const account1 = await WordActionDisLike.find({comment_id: comment[i]._id});
        comment[i].dislike = account1.length;
        comment[i].save();
    }
    comment.sort((a, b) => (a.like < b.like) ? 1 : -1);
    return res.json({code: 1, comment: comment});
}
// const createWordComment = async (req, res) => {
//     console.log('vao day chua');
//     const { word_id, user_id, content } = req.body;
//     var today = new Date();
//     const user = await User.findOne({_id: user_id});
//     // var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
//     const newComment = new WordComment({ word_id, user_id: user, content, time: today, review: 2 });
//     // socket.socket.emit("SEVER-SEND-NEWCOMMENT", {
//     //     comment: newComment,
//     //     username: user.username
//     // });
//     console.log('NEW COMMENT NE ', newComment);
//     await newComment.save(function (error, newComment) {
//         if (error) {
//             return res.json({ code: 0, error: error });
//         }
//         else {
//             return res.json({ code: 1, success: "Comment của bạn đợi quản trị viên xét duyệt ", comment: newComment });
//         }
//     })
// }

const createLikeWordComment = async (req, res) => {
    const { comment_id, user_id_like, checkStatus } = req.body;
    const check = await WordActionLike.findOne({ comment_id, user_id_like });
    WordActionDisLike.findOneAndRemove({  comment_id, user_id_dislike: user_id_like }, function (err) {
        if (err) {
            console.log(err);
            return res.json({ message: 'remove err' });
        }
        else {
            if(check) {
                WordActionLike.findOneAndRemove({ comment_id, user_id_like}, function(err) {
                    // socket.socket.emit("SEVER-SEND-LIKE", {
                    //     comment_id: comment_id,
                    //     islike: true,
                    //     isdislike: checkStatus,
                    // });
                    return res.json('not like success');
                })
            }
            
            else {
                const newAction = new WordActionLike({ comment_id, user_id_like });
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

const countWordLike = async(req, res) => {
    const {comment_id} = req.body;
    const account = await WordActionLike.find({comment_id});
    return res.json(account.length);
}

const countWordDisLike = async(req, res) => {
    const {comment_id} = req.body;
    const account = await WordActionDisLike.find({comment_id});
    return res.json(account.length);
}

const createDisLikeWordComment = async (req, res) => {
    const { comment_id, user_id_dislike, checkStatus } = req.body;
    const check = await WordActionDisLike.findOne({ comment_id, user_id_dislike });
    WordActionLike.findOneAndRemove({  comment_id, user_id_like: user_id_dislike }, function (err) {
        if (err) {
            console.log(err);
            return res.json({ message: 'remove err' });
        }
        else {
            if(check) {
                WordActionDisLike.findOneAndRemove({ comment_id, user_id_dislike}, function(err) {
                    // socket.socket.emit("SEVER-SEND-DISLIKE", {
                    //     comment_id: comment_id,
                    //     isdislike: true,
                    //     islike: checkStatus,
                    // });
                    return res.json('not dislike success');
                })
            }

            else {
                const newAction = new WordActionDisLike({ comment_id, user_id_dislike });
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

const testWordComment = async(req, res) => {
    const comment = await WordComment.find();
    for (var i=0;i< comment.length; i++) {
        comment[i].review = 2;
        await comment[i].save();
    }
    return res.json({mess: 'success'});
}

const getAllWordComment = async(req, res) => {
    const comment = await WordComment.find().populate("user_id").populate("word_id");
    return res.json({comment: comment});
}
module.exports = {
    // createWordComment,
    getCommentTest,
    createLikeWordComment,
    createDisLikeWordComment,
    // userRequest,
    // browseComment,
    getCommentWord,
    countWordLike, 
    countWordDisLike,
    testWordComment,
    getAllWordComment
    // test,
};