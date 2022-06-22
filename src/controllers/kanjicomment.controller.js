const Kanji = require('../models/kanji/kanji.model');
const KanjiActionlike = require('../models/kanji/kanjiactionlike.model');
const KanjiActionDislike = require('../models/kanji/kanjiactiondislike.model');
const User = require('../models/user.model');
const KanjiComment = require('../models/kanji/kanjicomment.model');

const getKanjiComment = async(req, res) => {
    const {kanji_id, user_id} = req.body;
    const comment = await KanjiComment.find({kanji_id: kanji_id}).populate("user_id");
    for (var i=0;i<comment.length; i++) {
        const likee = await KanjiActionlike.findOne({comment_id: comment[i]._id, user_id_like: user_id});
        if(likee){
            comment[i].islike = true;
        }
        else{
            comment[i].islike = false;
        }
        const account = await KanjiActionlike.find({comment_id: comment[i]._id});
        comment[i].like = account.length;
        const dislikee = await KanjiActionDislike.findOne({comment_id: comment[i]._id, user_id_dislike: user_id});
        if(dislikee){
            comment[i].isdislike = true;
        }
        else{
            comment[i].isdislike = false;
        }
        const account1 = await KanjiActionDislike.find({comment_id: comment[i]._id});
        comment[i].dislike = account1.length;
        comment[i].save();
    }
    comment.sort((a, b) => (a.like < b.like) ? 1 : -1);
    return res.json({code: 1, comment: comment});
}

// const createKanjiComment = async (req, res) => {
//     const { kanji_id, user_id, content } = req.body;
//     var today = new Date();
//     const user = await User.findOne({_id: user_id});
//     // var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
//     const newComment = new KanjiComment({ kanji_id, user_id: user, content, time: today, review: 2 });
//     console.log('NEW COMMENT' , newComment);
//     await newComment.save(function (error, newComment) {
//         if (error) {
//             return res.json({ code: 0, error: error });
//         }
//         else {
//             return res.json({ code: 1, success: "Comment của bạn đợi quản trị viên xét duyệt ", comment: newComment });
//         }
//     })
// }

const createLikeKanjiComment = async (req, res) => {
    const { comment_id, user_id_like, checkStatus } = req.body;
    const check = await KanjiActionlike.findOne({ comment_id, user_id_like });
    KanjiActionDislike.findOneAndRemove({  comment_id, user_id_dislike: user_id_like }, function (err) {
        if (err) {
            console.log(err);
            return res.json({ message: 'remove err' });
        }
        else {
            if(check) {
                KanjiActionlike.findOneAndRemove({ comment_id, user_id_like}, function(err) {
                    return res.json('not like success');
                })
            }
            
            else {
                const newAction = new KanjiActionlike({ comment_id, user_id_like });
             newAction.save(function (error, newAction) {
                if (error) {
                    return res.json({ code: 0, error: "network error" });
                }
                else {
                    
                        return res.json({ code: 1, success: "action success", action: newAction });
                    
                }
            })
            }
            
        }

    });
}


const createDisLikeKanjiComment = async (req, res) => {
    const { comment_id, user_id_dislike, checkStatus } = req.body;
    const check = await KanjiActionDislike.findOne({ comment_id, user_id_dislike });
    KanjiActionlike.findOneAndRemove({  comment_id, user_id_like: user_id_dislike }, function (err) {
        if (err) {
            console.log(err);
            return res.json({ message: 'remove err' });
        }
        else {
            if(check) {
                KanjiActionDislike.findOneAndRemove({ comment_id, user_id_dislike}, function(err) {
                    return res.json('not dislike success');
                })
            }

            else {
                const newAction = new KanjiActionDislike({ comment_id, user_id_dislike });
             newAction.save(function (error, newAction) {
                if (error) {
                    return res.json({ code: 0, error: "loix xay ra, vui long th lai" });
                }
                else {
                        return res.json({ code: 1, success: "action success", action: newAction });
                    
                    
                }
            })
            }
        }

    });
}

const getAllKanjiComment = async(req, res) => {
    const comment = await KanjiComment.find().populate("user_id").populate("kanji_id");
    return res.json({comment: comment});
}
module.exports = {
    getKanjiComment,
    // createKanjiComment,
    createLikeKanjiComment,
    createDisLikeKanjiComment,
    getAllKanjiComment
}