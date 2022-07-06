const Post = require('../models/communication/post.model');
const LikePost = require('../models/communication/likepost.model');
const User = require('../models/user.model');

// const getPost = async (req, res) => {
//     const { id } = req.body;
//     Post.aggregate([
//         {
//             $lookup: {
//                 from: "likeposts",
//                 let: { user: "$userId._id", idd: "$_id" },
//                 pipeline: [
//                     {
//                         $match:
//                         {
//                             $expr:
//                             {
//                                 $and:
//                                     [
//                                         { $eq: ["$$user", id] },
//                                         { $eq: ["$$idd", "$postId"] }
//                                     ]
//                             }
//                         }
//                     },
//                     { $project: { islike: 1, _id: 0 } }
//                 ],
//                 as: "likeposts"
//             }

//         }
//     ], function async(err, data) {
//         if (err) {
//             return res.json({ code: 0, errMsg: err });
//         } else {
//             const forloop = async () => {
//                 for (var i = 0; i < data.length; i++) {
//                     const count = await LikePost.find({ postId: data[i]._id });
//                     data[i].countlike = count.length;
//                 }
//                 console.log('DATA BEN API NE ', data);
//                 return res.json({ code: 1, postData: data });
//             }
//             forloop();
//             // return res.json({ code: 1, postData: data.length });
//         }
//     })
// }


const getPost = async (req, res) => {
    console.log('O DIE MEJ VAOF GET POST CHUWA');
    const { id } = req.body;
    Post.aggregate([
        {
            $lookup: {
                from: "likeposts",
                let: { user: "$userId", idd: "$_id" },
                pipeline: [
                    {
                        $match:
                        {
                            $expr:
                            {
                                $and:
                                    [
                                        { $eq: ["$userId", id] },
                                        { $eq: ["$$idd", "$postId"] }
                                    ]
                            }
                        }
                    },
                    { $project: { islike: 1, _id: 0 } }
                ],
                as: "likeposts"
            },
           
        },
        { $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_id"
          }},
    ], function async(err, data) {
        if (err) {
            return res.json({ code: 0, errMsg: err });
        } else {
            const forloop = async () => {
                // data = await Post.populate(data, { path: '_id' })
                // data = await Post.populate(data, {path: "user_id", select: 'user post'});
                for (var i = 0; i < data.length; i++) {
                    const count = await LikePost.find({ postId: data[i]._id });
                    data[i].countlike = count.length;
                }
                return res.json({ code: 1, postData: data });
            }
            forloop();
            // return res.json({ code: 1, postData: data.length });
        }
    })
}

const createPost = async (req, res) => {
    const { userId, title, theme, content, dataVocuShare, requ } = req.body;
    var today = new Date();
    const newPost = new Post({user_id: userId, time: today, title, theme, content, countlike: 0, dataVocuShare, review: requ });
    await newPost.save(function (err) {
        if (err) {
            return res.json({ code: 0, error: err });
        }
        else {
            return res.json({ code: 1, newPost: newPost });
        }
    })
    
}

const createlikePost = async (req, res) => {
    const { userId, postId } = req.body;
    const post = await LikePost.findOne({ userId, postId });
    if (post) {
        LikePost.findOneAndRemove({ userId, postId }, function (err) {
            if (err) {
                console.log(err);
                res.json({ message: 'error' });
            }
            else {
                console.log('remove success');
                res.json({ message: 'remove success' });
            }
        })
    }
    else {
        const newLike = new LikePost({ userId, postId });
        await newLike.save(function (error, newLike) {
            if (error) {
                return res.json({ code: 0, error: error });
            }
            else {
                console.log('memerize success');
                return res.json({ code: 1, success: 'memerize success', newLike: newLike });

            }
        })
    }
}

const createCommentPost = async (req, res) => {
    const { id, user, content } = req.body;
    var today = new Date();
    const comment = { "user": user, time: today, content: content };
    const post = await Post.findOne({ _id: id });
    if (post) {
        post.comment.push(comment);
        await post.save();
        return res.json('success');
    }
    else {
        return res.json('error');
    }

}
const editPost = async (req, res) => {
    const { id, content, title, theme } = req.body;
    var today = new Date();
    const post = await Post.findOne({ _id: id });
    if (post) {
        post.content = content;
        post.title = title;
        post.theme = theme;
        post.time = today;
        await post.save();
        return res.json('success');
    }
    else {
        return res.json('error');
    }
}

const deletePost = async (req, res) => {
    const { id } = req.body;
    Post.findOneAndRemove({ _id: id }, function (err) {
        if (err) {
            console.log('loi roi');
            return res.json({ message: 'remove err' });
        }
        else {
            return res.json({ message: 'remove success' });
        }
    })

}

const acceptPost = async (req, res) => {
    const { list } = req.body;
    for (var i = 0; i < list.length; i++) {
        const post = await Post.findOne({ _id: list[i] });
        if (post) {
            post.review = 1;
            await post.save();
            
        }
    }
    return res.json({mess: 'accept success'});
}
const refusePost = async (req, res) => {
    const { list } = req.body;
    for (var i = 0; i < list.length; i++) {
        const post = await Post.findOne({ _id: list[i] });
        if (post) {
            post.review = 0;
            await post.save();
            
        }
    }
    return res.json({mess: 'refuse success'});
}
const setReviewPost = async(req, res) => {
    const post = await Post.find();
    for(var i=0;i<post.length;i++) {
        post[i].review=2;
        await post[i].save();
    }
    return res.json('xong');
}

const testPost = async(req, res) => {
    const post = await Post.find().populate("user_id");
    console.log(post);
}
module.exports = {
    getPost,
    createPost,
    createlikePost,
    createCommentPost,
    editPost,
    deletePost,
    acceptPost,
    refusePost,
    setReviewPost,
    testPost
}
