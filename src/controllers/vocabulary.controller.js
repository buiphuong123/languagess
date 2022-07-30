const Vocabulary = require('../models/vocabulary/vocabulary.model');
const nodemailer = require("nodemailer");
const User = require('../models/user.model');
const Notification = require('../models/notification.model');
const axios = require('axios');
const getVocabulary = async (req, res) => {
    const { user_id } = req.body;
    const vocabulary = await Vocabulary.find({ user_id: user_id }).populate({
        path: 'share',
        populate: { path: 'share' }
    });
    return res.json({ vocabulary: vocabulary, code: 1 });
}

const getVocabularyShare = async (req, res) => {
    const { user_id } = req.body;
    console.log(user_id);
    var vocabulary = await Vocabulary.find({ 'user_id': { $nin: user_id }, typeShare: 1 }).populate("user_id");
    const alldata = await Vocabulary.find({ 'user_id': { $nin: user_id }, typeShare: 2 }).populate("user_id");
    // const allData = await Vocabulary.find();
    alldata.map((e) => {
        if (e.share.findIndex(x =>JSON.stringify(x) === JSON.stringify(user_id)) !== -1) {
            console.log('vao day khong');
            vocabulary = vocabulary.concat(e);
        }
    })

    return res.json({ vocabulary: vocabulary, code: 1 });
}


const createVocabulary = async (req, res) => {
    const { user_id, name, dataElement, date } = req.body;
    // const data
    const vocabulary = new Vocabulary({ name, user_id, date, data: dataElement, date, typeShare: 0 });
    await vocabulary.save();
    return res.json({ mess: 'save success', vocabulary: vocabulary });
}
const editVocabulary = async (req, res) => {
    const { id, name, date } = req.body;
    const vocabulary = await Vocabulary.findOne({ _id: id });
    vocabulary.name = name;
    vocabulary.date = date;
    await vocabulary.save();
}

const deleteVocabulary = async (req, res) => {
    const { id } = req.body;
    Vocabulary.findOneAndRemove({ _id: id }, function (err) {
        if (err) {
            console.log('loi roi');
            return res.json({code: 0, message: 'remove err' });
        }
        else {
            return res.json({code: 1, message: 'remove success' });
        }
    })
}

// const deleteVocabularyShare = async (req, res) => {
//     const { id } = req.body;

// }

const createWordInVoca = async (req, res) => {
    console.log('dit me vao day');
    const { id, word, translate, vn, type, note, date, explain } = req.body;
    console.log('datae truyen vao la ', date);
    console.log('DATA DAU VAO DE ADD DAY NHE ', id, word, translate, vn, type, note, date, explain);
    const vocabulary = await Vocabulary.findOne({ _id: id });
    if (vocabulary) {
        const a = {};
        a.word = word;
        a.translate = translate;
        a.vn = vn;
        a.type = type;
        a.note = note;
        a.date = date;
        a.explain = explain;
        console.log('dât duoc tao la ', a);
        vocabulary.data.push(a);
        await vocabulary.save();
        return res.json({code: 1, mess: 'add success'});
    }
    else {
        return res.json({code: 1, mess: 'add fail'});
    }
}
const create = async (req, res) => {
    const { id, worddata } = req.body;
    const vocabulary = await Vocabulary.findOne({ _id: id });
    if (vocabulary) {
        vocabulary.data.push(worddata);
        await vocabulary.save();
        return res.json('add success');
    }
    else {
        return res.json('error');
    }
}
const editWordInVoca = async (req, res) => {
    const { id, name, newName } = req.body;
    const vocabulary = await Vocabulary.findOne({ _id: id });
    if (vocabulary) {
        const objIndex = vocabulary.data.findIndex(e => e.word === name);
        if (objIndex !== -1) {
            vocabulary.data[objIndex].vn = newName;
            await vocabulary.save(function (error, vocabulary) {
                if (error) {
                    return res.json({ code: 0, error: error });
                }
                else {
                    return res.json({ code: 1, success: 'edit success', vocabulary });
                }
            });
        }
    }
}
const deleteWordInVoca = async (req, res) => {
    const { id, word } = req.body;
    console.log('vao day nhe');
    console.log(id, word);
    const vocabulary = await Vocabulary.findOne({ _id: id });
    if (vocabulary) {
        const objIndex = vocabulary.data.findIndex(e => e.word === word);
        console.log(objIndex);
        if (objIndex !== -1) {
            vocabulary.data.splice(objIndex, 1);
            await vocabulary.save();
            return res.json('delete success');
        }
    }

}

const shareVocabulary = async (req, res) => {
    const date = new Date();
    const { id, listUserShare, remind, noti, user_id_share, typeShare } = req.body;
    console.log(id, listUserShare, remind, noti, user_id_share, typeShare);
    const users = await User.findOne({_id: user_id_share});
    // console.log('noti la ', noti);
    // const usersss = await User.findOne({_id: userid});
    const listuser = listUserShare.map(function (el) { return el._id; });
    console.log('LIST USER SHARE LA ', listUserShare);
    const vocabulary = await Vocabulary.findOne({ _id: id });
    if (vocabulary) {
        vocabulary.share = listuser;
        vocabulary.remind = remind;
        vocabulary.typeShare = typeShare;
        await vocabulary.save();
        if (noti === true) {
            var content = "";

            var dataWord = undefined;
            var dataGrammar = undefined;
            var dataKanji = undefined;
            var dataPost = undefined;
            var dataVocu = undefined;
            var dataRemind = undefined;
            const data = await Vocabulary.findOne({ _id: id });
            if (data) {
                dataVocu = id;
                content = `${users.username} đã chia sẻ bộ từ vựng cho bạn: ${data.name}`;
                const time = new Date();
                
                for (var i = 0; i < listUserShare.length; i++) {
                    const newNotifi = new Notification({user_id: listUserShare[i]._id, content, time, action: "share",dataWord, dataGrammar,dataKanji, dataPost, dataVocu,dataRemind, typeNoti: "vocu",  isRead: false});
                    await newNotifi.save();
                    axios.post('https://fcm.googleapis.com/fcm/send', {
                        // "to": 'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ',
                        "to": listUserShare[i].notifiToken,
                        "notification": {
                            "body": content,
                            "title": "HongoApp"
                        },
                        "data": {
                            "action": "share",
                            "routedata": data,
                            "notification_id": newNotifi._id,
                            "type": "vocu"
                        },
                    }, {
                        headers: {
                            "Authorization": 'key=' + 'AAAAOQ8h2Bo:APA91bE7He0ohIpCkbStbkMl5n-5l6SqSl8cvTO47KcPARZINNozxiRuyD8cSZl8LR7damVxiqjQ90vet9OL-NjflUdEX4dTDFyT00MHxNH1VMKMQ6J64flpb8JkKdYubOSx1vhPqizf',
                            "Content-Type": "application/json"
                        }
                    })
                        .then(() => {
                            console.log('send success');
                            // return res.json({ mess: 'Notification send successfully' });

                        }).catch((err) => {
                            console.log('send error');
                            // return res.json({ mess: 'somethinh went wrongy' });

                        })
                }
            }

            return res.json({code: 1, mess: 'share success'});
            //     //         console.log('vao noti = true');
            //     for (var i = 0; i < listUserShare.length; i++) {
            //         //             // const userss = await User.findOne({_id: listUserShare[i]._id});
            //         //             // const voc   abularyUser = await Vocabulary.find({user_id: listUserShare[i]._id});
            //         //             const vocu = new Vocabulary({name: vocabulary.name, user_id: listUserShare[i]._id, data: vocabulary.data, share: [], usershare: usersss._id, remind: vocabulary.remind, date: date});
            //         //             await vocu.save();
            //         var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env['MAIL_ADDRESS'], pass: process.env['MAIL_PASSWORD'] } });
            //         var mailOptions = { from: process.env['MAIL_ADDRESS'], to: listUserShare[i].email, subject: `Share vocabulary`, text: 'Hello ' + listUserShare[i].username + ` ${usersss.username} share vocabulary ${vocabulary.name} \n\n Now it\'s time to learn Japanese` + '\n\nThank You!\n' };
            //         transporter.sendMail(mailOptions, function (err) {
            //             if (err) {
            //                 console.log('SEND MAIL ERROR');
            //                 console.log(err);
            //                 return res.json({ err });
            //             }
            //             console.log('SEND MAIL SUCCESS');
            //         });
            //     }

            //     return res.json('share success');
        }
    }
}
module.exports = {
    getVocabulary,
    createVocabulary,
    editVocabulary,
    deleteVocabulary,
    createWordInVoca,
    editWordInVoca,
    deleteWordInVoca,
    create,
    shareVocabulary,
    getVocabularyShare
}