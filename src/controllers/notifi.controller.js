const Notification = require('../models/notification.model.js');
const axios = require('axios');
const User = require('../models/user.model');
const Comment = require('../models/comment.model.js');
const Grammar = require('../models/grammar.model');
const WordComment = require('../models/word/wordcomment.model');
const KanjiComment = require('../models/kanji/kanjicomment.model');
const Word = require('../models/word/word.model.js');
const Post = require('../models/communication/post.model.js');
const Kanji = require('../models/kanji/kanji.model')
const createNotifi = async (req, res) => {
    const { username, content, time, action } = req.body;
    console.log(username, content, time, action);
    const newNotifi = new Notification({ username, content, time, action });
    await newNotifi.save(function (err) {
        if (err) {
            return res.json({ code: 0, error: err });
        }
        else {
            return res.json({ code: 1, newNotifi: newNotifi });
        }
    })
}

const test1 = async (req, res) => {
    const sourceText = 'アーバイルスパシエ芝浦BAY-SIDE';
    const searchText = 'lkk';
    const lists = [
        '芝浦',
        '芝浦BAY-SIDE',
        'エ芝浦',
        'パシエ芝浦BAY'
    ];
const kk=[];
    lists.filter(item => {
        console.log(item.includes(searchText));
    });
    // ["エ芝浦", "パシエ芝浦BAY"]
}

const getNotifi = async (req, res) => {

    const { user_id } = req.body;
    const listNoti = await Notification.find({ user_id: user_id }).populate([{ path: 'dataWord' }, { path: 'dataGrammar' }, { path: 'dataKanji' }, { path: 'dataPost' }, { path: 'dataVocu' }, { path: 'dataRemind' }, {path: 'user_friends'}]);
    return res.json({ code: 1, listNoti: listNoti });
}


const sendNotiToDeviceAssetAgain = async (req, res) => {
    const { list_user, action, noti, type, username, user_id } = req.body;
    var content = "";
    for (var i = 0; i < list_user.length; i++) {
        var comment;
        if (type === "word") {
            comment = await WordComment.findOne({ _id: list_user[i] }).populate("user_id").populate("word_id");
        }
        else if (type === "grammar") {
            comment = await Comment.findOne({ _id: list_user[i] }).populate("user_id").populate("grammar_id");
        }
        else if (type === "kanji") {
            comment = await KanjiComment.findOne({ _id: list_user[i] }).populate("user_id").populate("kanji_id");
        }
        else {
            comment = await Post.findOne({ _id: list_user[i] }).populate("user_id");
        }
        // const comment = await WordComment.findOne({ _id: list_user[i] }).populate("user_id").populate("word_id");
        if (comment) {
            if (type === "post") {
                content = `${username} đã ${action} ${noti} của bạn`;
            }
            else {
                content = `${username} đã ${action} ${noti} của bạn: ${comment.content}`;
            }
            var time = new Date();
            // const dataaa = comment.word_id.toObject();
            var dataaa = {};
            if (type === "word") {
                dataaa = comment.word_id.toObject();
            }
            else if (type === "grammar") {
                dataaa = comment.grammar_id.toObject();
            }
            else if (type === "kanji") {
                dataaa = comment.kanji_id.toObject();
            }
            else {
                dataaa = comment.toObject();
            }

            // console.log('DATA WORD OF COMMENT LA ',dataaa); // data t lưu đây nhé 
            console.log('data test day nhe');
            const newNotifi = new Notification({ user_id, content, time, action, data: dataaa, typeNoti: type, isRead: false });
            await newNotifi.save(function (err) {
                if (err) {
                    console.log('error ben noti ne');
                    return res.json({ code: 0 });
                }
                else {
                    axios.post('https://fcm.googleapis.com/fcm/send', {
                        // "to": 'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ',
                        "to": comment.user_id.notifiToken,
                        "notification": {
                            "body": `${username} đã ${action} ${noti} của bạn: ${comment.content}`,
                            "title": "language"
                        },
                        "data": {
                            "action": action,
                            "routedata": type === "word" ? comment.word_id : type === "grammar" ? comment.grammar_id : type === "kanji" ? comment.kanji_id : comment,
                            "notification_id": newNotifi._id,
                            "type": type
                        },
                    }, {
                        headers: {
                            "Authorization": 'key=' + 'AAAAOQ8h2Bo:APA91bE7He0ohIpCkbStbkMl5n-5l6SqSl8cvTO47KcPARZINNozxiRuyD8cSZl8LR7damVxiqjQ90vet9OL-NjflUdEX4dTDFyT00MHxNH1VMKMQ6J64flpb8JkKdYubOSx1vhPqizf',
                            "Content-Type": "application/json"
                        }
                    })
                        .then(() => {
                            console.log('send success');
                            return res.json({ mess: 'Notification send successfully' });

                        }).catch((err) => {
                            console.log('send error');
                            return res.json({ mess: 'somethinh went wrongy' });

                        })
                }
            })

        }
    }
}

const sendNotiToDeviceAsset = async (req, res) => {
    const { id, comment_content, action, noti, type, user, user_noti, notifi_token } = req.body;
    console.log(id, comment_content, action, noti, type, user, user_noti, notifi_token);

    var content = "";

    var dataWord = undefined;
    var dataGrammar = undefined;
    var dataKanji = undefined;
    var dataPost = undefined;
    var dataVocu = undefined;
    var dataRemind = undefined;
    var data = {};
    if (type === "word") {
        data = await Word.findOne({ _id: id });
        if (data) {
            dataWord = id;
        }
    }
    else if (type === "grammar") {
        data = await Grammar.findOne({ _id: id });
        if (data) {
            dataGrammar = id;
        }
    }
    else if (type === "kanji") {
        data = await Kanji.findOne({ _id: id });
        if (data) {
            dataKanji = id;
        }
    }
    else {
        data = await Post.findOne({ _id: id });
        if (data) {
            dataPost = id;
        }
    }
    // const comment = await WordComment.findOne({ _id: list_user[i] }).populate("user_id").populate("word_id");
    if (data) {
        if (type === "post") {

            content = `${user.username} đã bình luận bài viết của bạn`;
        }
        else {
            content = `${user.username} đã bày tỏ cảm xúc về bình luận của bạn: ${comment_content}`;
        }
    }
    var time = new Date();
    const newNotifi = new Notification({ user_id: user_noti, content, time, action, dataWord, dataGrammar, dataKanji, dataPost, dataVocu, dataRemind, typeNoti: type, isRead: false, user_friends: user });
    await newNotifi.save(function (err) {
        if (err) {
            console.log(err);
            return res.json({ code: 0 });
        }
        else {
            axios.post('https://fcm.googleapis.com/fcm/send', {
                // "to": 'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ',
                "to": notifi_token,
                "notification": {
                    "body": content,
                    "title": "language"
                },
                "data": {
                    "action": action,
                    "routedata": data,
                    "notification_id": newNotifi._id,
                    "type": type
                },
            }, {
                headers: {
                    "Authorization": 'key=' + 'AAAAOQ8h2Bo:APA91bE7He0ohIpCkbStbkMl5n-5l6SqSl8cvTO47KcPARZINNozxiRuyD8cSZl8LR7damVxiqjQ90vet9OL-NjflUdEX4dTDFyT00MHxNH1VMKMQ6J64flpb8JkKdYubOSx1vhPqizf',
                    "Content-Type": "application/json"
                }
            })
                .then(() => {
                    console.log('send success');
                    return res.json({ mess: 'Notification send successfully' });

                }).catch((err) => {
                    console.log('send error');
                    return res.json({ mess: 'somethinh went wrongy' });

                })
        }
    })

}





const sendNotiToDevice = async (req, res) => {
    const { username, username_friends, action, comment_id, word, noti } = req.body;
    console.log(username, username_friends, action, comment_id, word);
    const userfriends = await User.findOne({ username: username_friends });
    // console.log(userfriends);
    var comment;
    if (noti === 'word') {
        comment = await WordComment.findOne({ _id: comment_id });
    }
    else if (noti === 'grammar') {
        comment = await Comment.findOne({ _id: comment_id }); // nó k tìm ddc cái này nè
    }
    else if (noti === 'kanji') {
        comment = await KanjiComment.findOne({ _id: comment_id });
    }

    const content = `${username} ${action} your comment ${comment.content}`;
    var time = new Date();
    const newNotifi = new Notification({ username: username_friends, content, time, action, comment_id, data: word });
    await newNotifi.save(function (err) {
        if (err) {
            console.log('loi a');
            return res.json({ code: 0 });
        }
        else {
            axios.post('https://fcm.googleapis.com/fcm/send', {
                // "to": 'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ',
                "to": userfriends.notifiToken,
                "notification": {
                    "body": `${username} ${action} your comment ${comment.content}`,
                    "title": "language"
                },
                "data": {
                    "action": action,
                    "routedata": word,
                    "notification_id": newNotifi._id,
                },
            }, {
                headers: {
                    "Authorization": 'key=' + 'AAAAOQ8h2Bo:APA91bE7He0ohIpCkbStbkMl5n-5l6SqSl8cvTO47KcPARZINNozxiRuyD8cSZl8LR7damVxiqjQ90vet9OL-NjflUdEX4dTDFyT00MHxNH1VMKMQ6J64flpb8JkKdYubOSx1vhPqizf',
                    "Content-Type": "application/json"
                }
            })
                .then(() => {
                    res.status(200).send('Notification send successfully');
                }).catch((err) => {
                    res.status(400).send('somethinh went wrongy');
                    console.log('loi ow ben gui nay a', userfriends.notifiToken, userfriends.username);
                })
        }
    })


}

const editReadNotifi = async (req, res) => {
    const { notification_id } = req.body;
    const notifi = await Notification.findOne({ _id: notification_id });
    if (notifi) {
        // if(notifi.isRead === false ) {
        //     return res.json({mess: 'da doc r'});
        // }
        notifi.isRead = true;
        notifi.save(function (err) {
            return res.json({ code: 1, err })
        })
    }
}

const takeData = async (req, res) => {
    const { grammar_id } = req.body;
    const word = await Grammar.findOne({ _id: grammar_id });
    if (word) {
        console.log('Data truyen vaof ExplainScreen', word);
    }
    else {
        console.log('khong co data');
    }

}

const testsend = async (req, res) => {

    axios.post('https://fcm.googleapis.com/fcm/send', {
        // "to": 'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ',
        "to": "cI4OktEZTVW28XPXi-Mgw_:APA91bGDBdzKuEGDBEj6S1OgEVAqzQW0NRY5pYnqTEQOGjf7hjpzPrUz6JDsuMKf42DUd9SDkfzETE_tQ5SAMi9D-O0-lQbvVkfGbHdXrBEdL2o8kzOQwAY7BwSx62NRJHhhlfq_olVF",
        "notification": {
            "body": "chan thấy mồ",
            "title": "language"
        }

    }, {
        headers: {
            "Authorization": 'key=' + 'AAAAOQ8h2Bo:APA91bE7He0ohIpCkbStbkMl5n-5l6SqSl8cvTO47KcPARZINNozxiRuyD8cSZl8LR7damVxiqjQ90vet9OL-NjflUdEX4dTDFyT00MHxNH1VMKMQ6J64flpb8JkKdYubOSx1vhPqizf',
            "Content-Type": "application/json"
        }
    })
        .then(() => {
            console.log('send success');
            return res.json({ mess: 'Notification send successfully' });

        }).catch((err) => {
            console.log('send error');
            return res.json({ mess: 'somethinh went wrongy' });

        })
}


module.exports = {
    testsend,
    sendNotiToDevice,
    createNotifi,
    getNotifi,
    test1,
    takeData,
    editReadNotifi,
    sendNotiToDeviceAsset
};