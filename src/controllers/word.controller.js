const Word = require('../models/word/word.model');
const WordMem = require('../models/word/wordmem.model');
const WordActionLike = require('../models/word/wordactionlike.model');
const WordComment = require('../models/word/wordcomment.model');
const WordActionDisLike = require('../models/word/wordactiondislike.model');
const WordExample = require('../models/word/wordexample.model');
const User = require('../models/user.model');
const Kuroshiro = require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');
const axios = require('axios');
const WordLike = require('../models/word/wordlike.model');
const Comment = require('../models/comment.model');
const KanjiComment = require('../models/kanji/kanjicomment.model');

const createWordNew = async(req, res) => {
    console.log('vao create day nhe');
    const {word, translate, vn, means, kind, amhan, level, images, lession, example} = req.body;
    const newWord = new Word({word, translate, vn, means, kind, amhan, level, images, lession});
     await newWord.save(function(err) {
        if(err) {
            return res.json({code: 0,mess: 'tao loij'});
        }
        else {
            console.log('save success')
            for(var i=0;i<example.length; i++) {
                const kuroshiro = new Kuroshiro();
            kuroshiro.init(new KuromojiAnalyzer())
                .then(function () {
                    return kuroshiro.convert(example[i].jp, { mode: "furigana", to: "hiragana" });
                })
                .then(function (result) {
                    // "<ruby>感<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>じ<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>れたら<ruby>手<rp>(</rp><rt>て</rt><rp>)</rp></ruby>を<ruby>繋<rp>(</rp><rt>つな</rt><rp>)</rp></ruby>ごう"
                    var str1 = result.replaceAll("<ruby>", "a");
                    var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
                    var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
                    var str4 = str3.replaceAll("</ruby>", "m");
                    var str5 = str4.split(/a|m/);
                    var i;
                    const strResult = [];
                    for (i = 0; i < str5.length; i++) {
                        if (Kuroshiro.Util.isHiragana(str5[i]) || Kuroshiro.Util.isKatakana(str5[i])) {
                            strResult.push({ value: str5[i], furi: "" });
                        }
                        else {
                            if (i == 0) {

                            }
                            else {
                                var ss = str5[i].split(/c|b/);
                                strResult.push({ value: ss[0], furi: ss[1] });
                            }
                        }
                    }
                    const newExample = new WordExample({ word_id: newWord._id, jp: strResult, vn: example[i].vn });
                    newExample.save();
                    
                })
            }
            return res.json({code: 1, mess: 'create  word success', word: newWord});

        }
    })

    

}

const editWordNew = async(req, res) => {
    const {id, word, translate, vn, means, kind, amhan, images, example, newExamples} = req.body;
    // const newWord = new Word({word, translate, vn, means, kind, amhan, level, images, lession});
    const wordEdit = await Word.findOne({_id: id});
    if(wordEdit) {
        wordEdit.word = word;
        wordEdit.translate = translate;
        wordEdit.vn = vn;
        wordEdit.means = means;
        wordEdit.kind = kind;
        wordEdit.amhan = amhan;
        wordEdit.images = images;
        await wordEdit.save(function(err) {
            if(err) {
                return res.json({code: 0,mess: 'tao loij'});
            }
            else {
                // const ex = await WordExample.fin
                for(var i=0;i<example.length;i++){
                    // const exxx = await WordExample.findOne({_id: example})
                    WordExample.findOneAndRemove({_id: example[i]._id}, function(err) {
                        if(err) {
                            console.log('loi');
                        }
                        else {
                            console.log('success');
                        }
                    })
                }
                for(var i=0;i<newExamples.length; i++) {
                    const kuroshiro = new Kuroshiro();
                kuroshiro.init(new KuromojiAnalyzer())
                    .then(function () {
                        return kuroshiro.convert(newExamples[i].jp, { mode: "furigana", to: "hiragana" });
                    })
                    .then(function (result) {
                        // "<ruby>感<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>じ<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>れたら<ruby>手<rp>(</rp><rt>て</rt><rp>)</rp></ruby>を<ruby>繋<rp>(</rp><rt>つな</rt><rp>)</rp></ruby>ごう"
                        var str1 = result.replaceAll("<ruby>", "a");
                        var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
                        var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
                        var str4 = str3.replaceAll("</ruby>", "m");
                        var str5 = str4.split(/a|m/);
                        var i;
                        const strResult = [];
                        for (i = 0; i < str5.length; i++) {
                            if (Kuroshiro.Util.isHiragana(str5[i]) || Kuroshiro.Util.isKatakana(str5[i])) {
                                strResult.push({ value: str5[i], furi: "" });
                            }
                            else {
                                if (i == 0) {
    
                                }
                                else {
                                    var ss = str5[i].split(/c|b/);
                                    strResult.push({ value: ss[0], furi: ss[1] });
                                }
                            }
                        }
                        const newExample = new WordExample({ word_id: id, jp: strResult, vn: newExamples[i].vn });
                        newExample.save();
                        
                    })
                }
                return res.json({code: 1, mess: 'edit  word success'});
    
            }
        })
    

    }
     

}
const getWord = async (req, res) => {
    console.log('vao get word');
    var { id } = req.body;  
    Word.aggregate([
        {
            $lookup: {
                from: "wordexamples",
                localField: "_id",
                foreignField: "word_id",
                as: "wordexample"
            }
        },
        {
            $lookup: {
                from: "wordlikes",
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
                                        { $eq: ["$$idd", "$wordId"] }
                                    ]
                            }
                        }
                    },
                    { $project: { isLike: 1, _id: 0 } }
                ],
                as: "likes"
            }

        },
        {
            $lookup: {
                from: "wordmems",
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
                                        { $eq: ["$$idd", "$wordId"] }
                                    ]
                            }
                        }
                    },
                    { $project: { isMemerize: 1, _id: 0 } }
                ],
                as: "memerizes"
            }
        },
    ], function (err, data) {
        if (err) {
            res.json({ code: 0, errMsg: err });
        } else {
            console.log('data ne ', data);
            res.json({ code: 1, wordData: data });
        }
    })

}

const createMemWord = async (req, res) => {
    const { userId, wordId } = req.body;
    const word = await WordMem.findOne({ userId, wordId });
    if (word) {
        WordMem.findOneAndRemove({ userId, wordId }, function (err) {
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
        const newMem = new WordMem({ userId, wordId });
        await newMem.save(function (error, newMem) {
            if (error) {
                return res.json({ code: 0, error: error });
            }
            else {
                console.log('memerize success');
                return res.json({ code: 1, success: 'memerize success', nemWord: newMem });

            }
        })
    }

}

const createLikeWord = async (req, res) => {
    const { userId, wordId } = req.body;
    const word = await WordLike.findOne({ userId, wordId });
    if (word) {
        WordLike.findOneAndRemove({ userId, wordId }, function (err) {
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
        const newLike = new WordLike({ userId, wordId });
        await newLike.save(function (error, newLike) {
            if (error) {
                return res.json({ code: 0, error: error });
            }
            else {
                console.log('like success');
                return res.json({ code: 1, success: 'like success', likeWord: newLike });

            }
        })
    }

}

const createWordComment = async (req, res) => {
    const { word_id, user_id, content, requ } = req.body;
    console.log(word_id, user_id, content, requ);
    var today = new Date();
    // var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const newComment = new WordComment({ word_id, user_id: user_id, content, time: today, review: requ });
    // socket.socket.emit("SEVER-SEND-NEW-WORDCOMMENT", {
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

const createLikeWordComment = async (req, res) => {
    const { comment_id, user_id_like, checkStatus } = req.body;
    const check = await WordActionLike.findOne({ comment_id, user_id_like });
    WordActionDisLike.findOneAndRemove({ comment_id, user_id_dislike: user_id_like }, function (err) {
        if (err) {
            console.log(err);
            return res.json({ message: 'remove err' });
        }
        else {
            if (check) {
                WordActionLike.findOneAndRemove({ comment_id, user_id_like }, function (err) {
                    socket.socket.emit("SEVER-SEND-WORDLIKE", {
                        comment_id: comment_id,
                        islike: true,
                        isdislike: checkStatus,
                    });
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

                        socket.socket.emit("SEVER-SEND-WORDLIKE", {
                            comment_id: comment_id,
                            islike: false,
                            isdislike: checkStatus,
                        });
                        return res.json({ code: 1, success: "action success", action: newAction });

                    }
                })
            }

        }

    });
}

const countWordLike = async (req, res) => {
    const { comment_id } = req.body;
    const account = await WordActionLike.find({ comment_id });
    return res.json(account.length);
}

const countwordDisLike = async (req, res) => {
    const { comment_id } = req.body;
    const account = await WordActionDisLike.find({ comment_id });
    return res.json(account.length);
}

const createDisLikeWordComment = async (req, res) => {
    const { comment_id, user_id_dislike, checkStatus } = req.body;
    const check = await WordActionDisLike.findOne({ comment_id, user_id_dislike });
    WordActionLike.findOneAndRemove({ comment_id, user_id_like: user_id_dislike }, function (err) {
        if (err) {
            console.log(err);
            return res.json({ message: 'remove err' });
        }
        else {
            if (check) {
                WordActionDisLike.findOneAndRemove({ comment_id, user_id_dislike }, function (err) {
                    socket.socket.emit("SEVER-SEND-WORDDISLIKE", {
                        comment_id: comment_id,
                        isdislike: true,
                        islike: checkStatus,
                    });
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
                        socket.socket.emit("SEVER-SEND-WORDDISLIKE", {
                            comment_id: comment_id,
                            isdislike: false,
                            islike: checkStatus
                        });
                        return res.json({ code: 1, success: "action success", action: newAction });


                    }
                })
            }
        }

    });
}

const createWord = async (req, res) => {
    const { hira, kanji, vn, amhan, kata, level, type, typeWord, verbGround, typeVerb, typeAdj, exampleWord } = req.body;
    console.log('list example la ', exampleWord);
    console.log('gia tri cua kata la', kata);
    console.log(hira, kanji, vn, amhan);
    let newWord;
    let newExample;
    var j;
    if (kata !== '') {
        console.log('gia tri cuar kata day ne ', kata);
        console.log('vao kata khac rong');
        const wordkata = await Word.findOne({ kata });
        if (wordkata) {
            return res.json({ message: 'word da ton tai ben kata' });
        }
        else {
            newWord = new Word({ hira, kanji, vn, amhan, kata, level, type, typeWord, verbGround, typeVerb, typeAdj });
            await newWord.save();
            if (exampleWord.length !== 0) {
                for (j = 0; j < exampleWord.length; j++) {
                    const word_id = newWord._id;
                    const jp = exampleWord[j].jp;
                    const vn = exampleWord[j].vn;
                    const kuroshiro = new Kuroshiro();
                    kuroshiro.init(new KuromojiAnalyzer())
                        .then(function () {
                            return kuroshiro.convert(jp, { mode: "furigana", to: "hiragana" });
                        })
                        .then(function (result) {
                            // "<ruby>感<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>じ<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>れたら<ruby>手<rp>(</rp><rt>て</rt><rp>)</rp></ruby>を<ruby>繋<rp>(</rp><rt>つな</rt><rp>)</rp></ruby>ごう"
                            var str1 = result.replaceAll("<ruby>", "a");
                            var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
                            var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
                            var str4 = str3.replaceAll("</ruby>", "m");
                            var str5 = str4.split(/a|m/);
                            var i;
                            const strResult = [];
                            for (i = 0; i < str5.length; i++) {
                                if (Kuroshiro.Util.isHiragana(str5[i]) || Kuroshiro.Util.isKatakana(str5[i])) {
                                    strResult.push({ value: str5[i], furi: "" });
                                }
                                else {
                                    if (i == 0) {

                                    }
                                    else {
                                        var ss = str5[i].split(/c|b/);
                                        strResult.push({ value: ss[0], furi: ss[1] });
                                    }
                                }
                            }
                            newExample = new WordExample({ word_id, jp: strResult, vn });
                            newExample.save();

                        })
                }

            }
            return res.json({ exampleWord: exampleWord, message: 'Tao word thanh cong' });
        }
    }
    else if (hira !== undefined && kanji !== undefined) {
        console.log('vao hira vowi kanji khac rong');
        const wordhirakanji = await Word.findOne({ hira, kanji });
        if (wordhirakanji) {
            return res.json({ message: 'word da ton tai ben hira va kanji' });
        }
        else {
            newWord = new Word({ hira, kanji, vn, amhan, kata, level, type, typeWord, verbGround, typeVerb, typeAdj });
            await newWord.save();
            if (exampleWord.length !== 0) {
                for (j = 0; j < exampleWord.length; j++) {
                    const word_id = newWord._id;
                    const jp = exampleWord[j].jp;
                    const vn = exampleWord[j].vn;
                    const kuroshiro = new Kuroshiro();
                    kuroshiro.init(new KuromojiAnalyzer())
                        .then(function () {
                            return kuroshiro.convert(jp, { mode: "furigana", to: "hiragana" });
                        })
                        .then(function (result) {
                            // "<ruby>感<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>じ<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>れたら<ruby>手<rp>(</rp><rt>て</rt><rp>)</rp></ruby>を<ruby>繋<rp>(</rp><rt>つな</rt><rp>)</rp></ruby>ごう"
                            var str1 = result.replaceAll("<ruby>", "a");
                            var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
                            var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
                            var str4 = str3.replaceAll("</ruby>", "m");
                            var str5 = str4.split(/a|m/);
                            var i;
                            const strResult = [];
                            for (i = 0; i < str5.length; i++) {
                                if (Kuroshiro.Util.isHiragana(str5[i]) || Kuroshiro.Util.isKatakana(str5[i])) {
                                    strResult.push({ value: str5[i], furi: "" });
                                }
                                else {
                                    if (i == 0) {

                                    }
                                    else {
                                        var ss = str5[i].split(/c|b/);
                                        strResult.push({ value: ss[0], furi: ss[1] });
                                    }
                                }
                            }
                            newExample = new WordExample({ word_id, jp: strResult, vn });
                            console.log(newExample);
                            newExample.save();

                        })
                }

            }
            return res.json({ exampleWord: newExample, message: 'Tao word thanh cong' });
        }
    }
    else {
        return res.json({ message: 'word da ton tai' });
    }


}

const getAllWord = async (req, res) => {
    const word = await Word.find();
    return res.json({ word });
}

const testfind = async (req, res) => {
    const dataWordComment = [{ id: "kaka" }, { id: "mama" }];
    const idx = dataWordComment.map(object => object.id).indexOf("kakadaf");
    return res.json(idx);
}

const testData = async (req, res) => {
    axios.post('https://vi.mazii.net/api/search', {
        "dict": "javi",
        "query": "会う",
        "type": "word"

    }, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            // return res.json({data: response.data.data[0].audio});

            return res.json({ data: response.data });
        })
        .catch(function (error) {
            throw error;
        })

}
const shuffleArray = (array) => {
    let i = array.length - 1;
    for (; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    let arrayObj = [];
    for (var j = 0; j < array.length; j++) {
        arrayObj.push(array[j]);
    }
    return arrayObj;
}
const dataQuestionWord = async(req, res) => {
    // const {numberlession} = req.body;
    const {n5, n4, n3, n2, type, numberquestion, numberlession} = req.body;
    const data = await Word.find();
    // console.log(data);
    var listdata = [];
    if(n5 === true &&n4=== true&&n3=== true&&n2=== true) {
        listdata = listdata.concat(data);
    }
    else if(n5=== true&&n4=== true&&n3=== true) {
        listdata = data.filter((e) => e.level ===5) && data.filter((e) =>e.level===4) && data.filter((e) =>e.level ===3);
    }
    else if(n5=== true&&n4=== true&&n2=== true) {
        listdata = data.filter((e) => e.level ===5 )&& data.filter((e) =>e.level===4) &&data.filter((e) =>e.level ===2);
    }
    else if(n5=== true&&n3=== true&&n2=== true) {
        listdata = data.filter((e) => e.level ===5) && data.filter((e) =>e.level===3)&&data.filter((e) =>e.level ===2);

    }
    else if(n4=== true&&n3=== true&&n2=== true) {
        listdata = data.filter((e) => e.level ===4) && data.filter((e) =>e.level===3)&&data.filter((e) =>e.level ===2);

    }
    else if(n5=== true&&n4=== true) {
        listdata = data.filter((e) => e.level ===5 ) && data.filter((e) => e.level ===4);
    }
    else if(n5&&n3) {
        listdata = data.filter((e) => e.level ===5 )&&data.filter((e) => e.level===3);
    }
    else if(n5=== true&&n2=== true) {
        listdata = data.filter((e) => e.level ===5) &&data.filter((e) => e.level===2);
    }
    else if(n4=== true&&n3=== true) {
        listdata = data.filter((e) => e.level ===4 )&& data.filter((e) =>e.level===3);
    }
    else if(n4=== true&&n2=== true) {
        listdata = data.filter((e) => e.level ===4) && data.filter((e) =>e.level===2);
    }
    else if(n3=== true&&n2=== true) {
        listdata = data.filter((e) => e.level ===3) && data.filter((e) =>e.level===2);
    }
    else if(n5=== true) {
        listdata = data.filter((e) => e.level ===5);
    }
    else if(n4=== true) {
        listdata = data.filter((e) => e.level ===4);
    }
    else if(n3=== true) {
        listdata = data.filter((e) => e.level ===3);
    }
    else if(n2=== true) {
        listdata = data.filter((e) => e.level ===2);
    }
// console.log('list data o day ', listdata);
    // loai kiem tra
    if(type === 2){
        listdata = listdata.filter((e) => e.memerizes.length === 0);
    }
    else if(type === 3) {
        listdata = listdata.filter((e) => e.memerizes.length ===1);
    }
    else if(type===4) {
        listdata = listdata.filter((e) => e.likes.length ===1);
    }
    else {

    }

    var lession = numberlession.split(",");
    // console.log(numberlession.indexOf("oo"));
    if(numberlession.indexOf("-")!== -1) {
        for(var i=0;i<lession.length;i++) {
            if(lession[i].indexOf("-")!== -1) {
                var arr = lession[i];
                lession.splice(lession.indexOf(lession[i]), 1);
                arr=arr.split("-");
                lession = lession.concat(arr[0]);
                lession = lession.concat(arr[1]);
                var kaka = parseInt(arr[0], 10) +1;
                console.log('kaka day ne', arr[0], arr[1], kaka);
                while(kaka > parseInt(arr[0], 10) && kaka<parseInt(arr[1], 10)){
                    lession = lession.concat(kaka.toString());
                    kaka = kaka +1;
                }
            }
        }
    }
    console.log('lession day nhe',lession);

    var dataTest = [];
    for (var i=0;i<lession.length;i++) {
        dataTest = dataTest.concat(listdata.filter((e) => e.lession === parseInt(lession[i], 10)) );
    }
    // console.log(dataTest);

    // dang chon dap an
    // { id: 2, question: "かぜのときはこのくすりを（ ）ください。", answer: ["のりて", "のんで", "のって", "のむで"], anCorrect: "1" }]);
    console.log('DATA TEST LA ', dataTest);
    const question = [];
    var as;
    const typeqs = ["word", "vn"];
    for (var i=0;i<numberquestion;i++) {
        var a =Math.floor((Math.random() * dataTest.length) + 1);
        // console.log('dataTest la ', dataTest[a]);
        var rand = typeqs[Math.floor(Math.random() * typeqs.length)];
        console.log('rand la ', rand);
        if(rand ==='vn' ) {
            var qs = {};
            var arr = [];
            qs.question = dataTest[a].vn;
            console.log('check cai nay ne', dataTest[a].vn);
            // qs.chooseas = dataTest[a].word;
            arr.push(dataTest[Math.floor((Math.random() * dataTest.length) + 1)].word, dataTest[Math.floor((Math.random() * dataTest.length) + 1)].word, dataTest[Math.floor((Math.random() * dataTest.length) + 1)].word);
            // qs.ans2 = dataTest[Math.floor((Math.random() * dataTest.length) + 1)].word;
            // qs.ans3 = dataTest[Math.floor((Math.random() * dataTest.length) + 1)].word;
            arr.push(dataTest[a].word);
            const kaka = shuffleArray(arr);
            qs.answer = kaka;
            const index = kaka.findIndex(object => {
                return object === dataTest[a].word;
            });
            qs.anCorrect= index;

            question.push(qs);
        }
        else {
            var qs = {};
            var arr = [];
            qs.question = dataTest[a].word;
            arr.push(dataTest[Math.floor((Math.random() * dataTest.length) + 1)].vn, dataTest[Math.floor((Math.random() * dataTest.length) + 1)].vn, dataTest[Math.floor((Math.random() * dataTest.length) + 1)].vn);
            arr.push(dataTest[a].vn);
            console.log('arr la ', arr);
            const kaka = shuffleArray(arr);
            qs.answer = kaka;
            console.log('kaka la ', kaka);
            const index = kaka.findIndex(object => {
                return object === dataTest[a].word;
            });
            qs.anCorrect= index;
            // qs.chooseas = dataTest[a].vn;
            // qs.ans1 = dataTest[Math.floor((Math.random() * dataTest.length) + 1)].vn;
            // qs.ans2 = dataTest[Math.floor((Math.random() * dataTest.length) + 1)].vn;
            // qs.ans3 = dataTest[Math.floor((Math.random() * dataTest.length) + 1)].vn;
            question.push(qs);
        }
        
    }
    res.json(question);

    // console.log(question);
    // return res.json(question);

    // dang ghep tu
//     const ranNums = [];
//     var maxlength = dataTest.length;
//     j = 0;

// while (maxlength-- && ranNums.length<18) {
//     j = Math.floor(Math.random() * (maxlength+1));
//     var obqs = {};
//     obqs.word = dataTest[j].word;
//     obqs.vn = dataTest[j].vn;
//     ranNums.push(obqs);
//     dataTest.splice(j,1);
// }

// console.log(ranNums);
// return res.json(ranNums);
    


}

const setLessionWord = async(req, res) => {
    // const word = await Word.find({level: 4});
    // return res.json(word.length);
    var lession= 1;
    const word = await Word.find({level: 2});
    for (var i=0;i<word.length;i++){
        if(i >= 25*(lession-1)&& i<=25*lession){
            word[i].lession = lession;
            await word[i].save();
            console.log('save success');
        }
        else if (i > 25 * lession) {
            lession = lession + 1;
        }
    }
    console.log('ket thuc')
}
const wordQuestionTest = async (req, res) => {
    // const isN5test = true;
    // const isN4test = false;
    // const isN3test = false;
    // const isN2test = false;
    // axios.post('http://192.168.1.72:3002/language/getWord', {
    //     "id": "61590bbd7463724428b252d2"

    // }, {
    //     headers: {
    //         "Accept": "application/json",
    //         "Content-Type": "application/json"
    //     }
    // })
    //     .then((response) => {
    //         return res.json(response.data.wordData);

    //     })
    //     .catch(function (error) {
    //         throw error;
    //     })
    // const hantukaka = "NHẬT";
    // const hantu1 = hantukaka.split(", ")[0];
    // return res.json(hantu1);
    axios.post('https://vi.mazii.net/api/search', {
        "dict": "javi",
        "query": "階段",
        "type": "word"
    }, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            const dataInfo = response.data.data;
            // console.log('data info day nhe', dataInfo);
            const meansWord = dataInfo[0].means;
            let listkind = [];
            let listmeans = [];
            let kind = [];
            let means = [];
            for (l = 0; l < meansWord.length; l++) {
                // const examples = means[k].examples;
                // if(examples !== null) {

                // }
                if (meansWord[l].mean !== null) {
                    listmeans.push(meansWord[l].mean);
                }
                if (meansWord[l].kind !== null) {
                    listkind.push(meansWord[l].kind);
                }
            }
            for (var k = 0; k < listmeans.length; k++) {
                if (means.indexOf(listmeans[k]) === -1) {
                    means.push(listmeans[k])
                }
            }
            for (var k = 0; k < listkind.length; k++) {
                if (kind.indexOf(listkind[k]) === -1) {
                    kind.push(listkind[k])
                }
            }

            console.log('means la ', means);
            console.log('kind la ', kind);


        }
        )
        .catch(function (error) {
            throw error;
        })
}
const myfunction = async function(x) {
    const search = await Word.findOne({word: x})
   return search;
  }
  

const dataExample = async(req, res) => {
    console.log('vao day nhe');
    axios.get('https://vi.mazii.net/db/jlpt/vi-VN/word3.json', {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then(async(response) => {
            const data = response.data;
            for (var i =170; i < 180; i++) {
                const word = data[i].word;
                const wordEmeansWordx = await Word.findOne({word: word});
                // console.log(wordEmeansWordx);
                if(wordEmeansWordx) {
                    axios.post('https://vi.mazii.net/api/search', {
                    "dict": "javi",
                    "query": word,
                    "type": "word"
                }, {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                })
                .then((response) => {
                    const dataInfo = response.data.data;
                    // console.log('data info day nhe', dataInfo);
                    const meansWord = dataInfo[0].means;
                    for (l = 0; l < meansWord.length; l++) {
                        // console.log(meansWord[l]);
                        const exampleslist = meansWord[l].examples;
                        // console.log('examplelist', exampleslist);
                        if (exampleslist === null || exampleslist === undefined) {
                            
                        }
                        else {
                            // console.log('example day nhe', exampleslist);
                            for (var t = 0; t < exampleslist.length; t++) {
                                const jp = exampleslist[t].content;
                                const vn = exampleslist[t].mean;
                                if (jp !== null) {
                                    const kuroshiro = new Kuroshiro();
                                    kuroshiro.init(new KuromojiAnalyzer())
                                        .then(function () {
                                            return kuroshiro.convert(jp, { mode: "furigana", to: "hiragana" });
                                        })
                                        .then(function (result) {
                                            // "<ruby>感<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>じ<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>れたら<ruby>手<rp>(</rp><rt>て</rt><rp>)</rp></ruby>を<ruby>繋<rp>(</rp><rt>つな</rt><rp>)</rp></ruby>ごう"
                                            var str1 = result.replaceAll("<ruby>", "a");
                                            var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
                                            var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
                                            var str4 = str3.replaceAll("</ruby>", "m");
                                            var str5 = str4.split(/a|m/);
                                            var i;
                                            const strResult = [];
                                            for (i = 0; i < str5.length; i++) {
                                                if (Kuroshiro.Util.isHiragana(str5[i]) || Kuroshiro.Util.isKatakana(str5[i])) {
                                                    strResult.push({ value: str5[i], furi: "" });
                                                }
                                                else {
                                                    if (i == 0) {
                    
                                                    }
                                                    else {
                                                        var ss = str5[i].split(/c|b/);
                                                        strResult.push({ value: ss[0], furi: ss[1] });
                                                    }
                                                }
                                            }
                                            const newExample = new WordExample({ word_id: wordEmeansWordx._id, jp: strResult, vn: vn });
                                            newExample.save();
                                            console.log('success');
                    
                                        })
                                }
                            }
                    
                        }
                    
                    }

                })
                .catch(function (error) {
                    throw error;
                })

                }
            }
        })
        .catch(function (error) {
            throw error;
        })
}

const dataWord = async (req, res) => {
    let i;
    let j;
    let k;
    let lession = 0;
    axios.get('https://vi.mazii.net/db/jlpt/vi-VN/word3.json', {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then(async(response) => {
            // return res.json(response.data.length);
            const data = response.data;
            for (i = 0; i < data.length ; i++) {
                const find = await Word.findOne({word: data[i].word});
                if(!find) {
                    console.log('vao day');
                    var newWord;
                const word = data[i].word;
                const translate = data[i].phonetic;
                const vn = data[i].mean;
                axios.post('https://vi.mazii.net/api/search', {
                    "dict": "javi",
                    "query": word,
                    "type": "word"
                }, {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                })
                    .then((response) => {
                        var meansWord = [];
                        var level;
                        if(response.data.status === 302) {

                        }
                        else {
                            const dataInfo = response.data.data;
                        // console.log('data info day nhe word ', response.data);
                        // console.log(vn);
                    
                        meansWord = dataInfo[0].means;
                        level = dataInfo[0].jlpt;
                        }

                        axios.post('https://vi.mazii.net/api/search', {
                            "dict": "javi",
                            "query": word,
                            "type": "kanji"
                        }, {
                            headers: {
                                "Accept": "application/json",
                                "Content-Type": "application/json"
                            }
                        })
                            .then((response) => {
                                const arrayamhan = response.data.results;
                                // console.log(arrayamhan);
                                let amhan = '';
                                if(response.data.status === 302) {

                                }
                                // console.log('array am han la ', arrayamhan);
                                // const hantu = "";
                            
                                else {
                                    if (arrayamhan.length > 5) {
                                        const hantu1 = arrayamhan[0].mean.split(",")[0];
                                        amhan = amhan + hantu1
                                    }
                                    else {
                                        for (j = 0; j < arrayamhan.length; j++) {
                                            // const hantu1 = arrayamhan[j].mean.split(",")[0];
                                            if (arrayamhan[j].mean === "") {
    
                                            }
                                            const hantu1 = arrayamhan[j].mean.split(",")[0];
                                            amhan = amhan + "" + hantu1
                                        }
                                    }
                                }
                                //         // axios.get('https://vi.mazii.net/api/link_img/'+ word + '/5/0'), {
                                //         //     headers: {
                                //         //         "Accept": "application/json",
                                //         //         "Content-Type": "application/json"
                                //         //     }
                                //         // }).then((response) => {

                                //         // })

                                const linkurl = encodeURI('https://vi.mazii.net/api/link_img/' + word + '/5/0');
                                axios.get(linkurl, {
                                    headers: {
                                        "Accept": "application/json",
                                        "Content-Type": "application/json"
                                    }
                                })
                                    .then((response) => {
                                        let images = [];
                                        if (response.data.status === 302) {

                                        }
                                        else {
                                            images = response.data.data.list_img;
                                        }
                                        var listkind = [];
                                        var listmeans = [];
                                        var kind = [];
                                        var means = [];
                                        for (l = 0; l < meansWord.length; l++) {
                                            if (meansWord[l].mean !== null) {
                                                listmeans.push(meansWord[l].mean);
                                            }
                                            if (meansWord[l].kind !== null) {
                                                listkind.push(meansWord[l].kind);
                                            }
                                        }
                                        for (var k = 0; k < listmeans.length; k++) {
                                            if (means.indexOf(listmeans[k]) === -1) {
                                                means.push(listmeans[k])
                                            }
                                        }
                                        for (var k = 0; k < listkind.length; k++) {
                                            if (kind.indexOf(listkind[k]) === -1) {
                                                kind.push(listkind[k])
                                            }
                                        }



                                        newWord = new Word({ word, translate, vn, means, kind, amhan, level, lession, images });

                                        newWord.save();
                                       
                                        console.log('success ', word);
                                    })
                                    .catch(function (error) {
                                        // return res.json('word loi cho image', word);
                                        console.log('loi ben tuw image', vn);
                                        throw error;
                                    })
                            }).catch(function (error) {
                                console.log('loi ben tuw han tu', vn);
                                throw error;
                            })

                    })
                    .catch(function (error) {
                        throw error;
                    })
                }
                else {
                    console.log('co roi');
                }

            }

        })
        .catch(function (error) {
            throw error;
        })

        console.log('hoan thanh');
    // return res.json('success');
}

const getNameWord = async (req, res) => {
    const word = await Word.find();
    const length = word.length;
    return res.json({ length });
}

const randomNumber = (a, lenthmax) => {
    var arrRandom = [];
    var value = 0;
    while(value <3){
        var b = Math.floor((Math.random() * lenthmax) + 1);
        const index = arrRandom.findIndex(object => {
            return object === b;
        });
        if(index === -1 && b!=a) {
            arrRandom.push(b);
            value++;
        }

    }
    return arrRandom;
}
const testRamdom = async(req, res) => {
    const arr = randomNumber(1, 12);
    return res.json(arr);
}

const checkStringJapan = async(req, res) => {
    var regex = /[\u3000-\u303F]|[\u3040-\u309F]|[\u30A0-\u30FF]|[\uFF00-\uFFEF]|[\u4E00-\u9FAF]|[\u2605-\u2606]|[\u2190-\u2195]|\u203B/g; 
    var input = "読み方 haha hh";
    var kaka = "abc" ;
    if(input.match(kaka)) {
        console.log("Japanese characters contain")
    }
    else {
        console.log("No Japanese characters");
    }
}

const deleteWord = async(req, res) => {
    console.log('vao delete ne');
    const {id} = req.body;
    Word.findOneAndRemove({_id: id}, function(err) {
        if(err) {
            console.log(err);
            return res.json({code: 0,message: 'remove err'});
        }
        else {
            console.log('success nha remove');
            return res.json({code: 1,message: 'remove success'});
        }
    })

}

const accpetComment = async(req, res) => {
    const { list, type } = req.body;
    for (var i = 0; i < list.length; i++) {
        // const comment = await WordComment.findOne({ _id: list[i] });
        if(type === "Từ vựng") {
            const comment = await WordComment.findOne({ _id: list[i] });
            if (comment) {
                comment.review = 1;
                await comment.save();
                
            }
        }
        else if (type === "Ngữ pháp") {
            const comment = await Comment.findOne({ _id: list[i] });
            if (comment) {
                comment.review = 1;
                await comment.save();
                
            }
        }
        else {
            const comment = await KanjiComment.findOne({ _id: list[i] });
            if (comment) {
                comment.review = 1;
                await comment.save();
                
            }
        }
    }
    return res.json({mess: 'accept success'});
}
const refuseComment = async(req, res) => {
    const { list, type } = req.body;
    for (var i = 0; i < list.length; i++) {
        // const comment = await WordComment.findOne({ _id: list[i] });
        // if (comment) {
        //     comment.review = 0;
        //     await comment.save();
            
        // }
        if(type === "Từ vựng") {
            const comment = await WordComment.findOne({ _id: list[i] });
            if (comment) {
                comment.review = 0;
                await comment.save();
                
            }
        }
        else if (type === "Ngữ pháp") {
            const comment = await Comment.findOne({ _id: list[i] });
            if (comment) {
                comment.review = 0;
                await comment.save();
                
            }
        }
        else {
            const comment = await KanjiComment.findOne({ _id: list[i] });
            if (comment) {
                comment.review = 0;
                await comment.save();
                
            }
        }
    }
    return res.json({mess: 'refuse success'});
}
const numberWord = async(req, res) => {
    const word= await Word.find({level: 2});
    return res.json({number: word.length}); // n5: 440, 4: 468, 3: 1297, n2: 1261
}

const testttt = async(req, res) => {
    let arr1 = [
        { id: "abdc4050", date: "2017-01-24", islike: false },
        { id: "abdc4051", date: "2017-01-24", islike: false },
        { id: "abdc4052", date: "2017-01-22", check: true }
    ];
    
    let arr2 = [
        { id: "abdc4052", name: "not", date: "not", check: false },
        { id: "abdc4051", name: "ab", date: "2017-02-24", islike: true },
    ];
    
    let arr3 = arr1.map((item, i) => Object.assign({}, item, arr2[i]));
    
    console.log(arr3);
}


const lessionWord = async(req, res) => {
    const word = await Word.find({level: 2, lession:51 });
    console.log(word.length);
    for (var i=40;i<60;i++) {
        word[i].lession = 53;
        await word[i].save();
        console.log('success');
    }
   console.log('ket thuc');
// console.log(word.length);
//    for(var i=30;i<lengthss.length;i++) {
//     lengthss[i].lession = 51;
//     await lengthss[i].save();
//     console.log('success');
//    }
//    console.log('ket thuc');
//    return res.json({length: word.filter(e=>e.lession ===0).length});
    // for (var i=0;i<word.length;i++) {
    //     // console.log(word[i].lession);
    //     if(word[i].lession === 0){
    //         word[i].lession = 51;
    //         await word[i].save();
    // console.log('success');
    //     }
    // }
    console.log('ket thuc')
}


module.exports = {
    editWordNew,
    createWordNew,
    lessionWord,
    testttt,
    numberWord,
    dataQuestionWord,
    createWord,
    getWord,
    createMemWord,
    createLikeWord,
    createWordComment,
    createLikeWordComment,
    createDisLikeWordComment,
    countWordLike,
    countwordDisLike,
    getAllWord,
    testfind,
    testData,
    wordQuestionTest,
    dataWord,
    getNameWord,
    dataExample,
    setLessionWord,
    testRamdom,
    checkStringJapan,
    deleteWord,
    accpetComment,
    refuseComment
};


// for (l = 0; l < meansWord.length; l++) {
//     // console.log(meansWord[l]);
//     const exampleslist = meansWord[l].examples;
//     // console.log('examplelist', exampleslist);
//     if (exampleslist === null || exampleslist === undefined) {
        
//     }
//     else {
//         // console.log('example day nhe', exampleslist);
//         for (var t = 0; t < exampleslist.length; t++) {
//             const jp = exampleslist[t].content;
//             const vn = exampleslist[t].transcription;
//             if (jp !== null) {
//                 const kuroshiro = new Kuroshiro();
//                 kuroshiro.init(new KuromojiAnalyzer())
//                     .then(function () {
//                         return kuroshiro.convert(jp, { mode: "furigana", to: "hiragana" });
//                     })
//                     .then(function (result) {
//                         // "<ruby>感<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>じ<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>れたら<ruby>手<rp>(</rp><rt>て</rt><rp>)</rp></ruby>を<ruby>繋<rp>(</rp><rt>つな</rt><rp>)</rp></ruby>ごう"
//                         var str1 = result.replaceAll("<ruby>", "a");
//                         var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
//                         var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
//                         var str4 = str3.replaceAll("</ruby>", "m");
//                         var str5 = str4.split(/a|m/);
//                         var i;
//                         const strResult = [];
//                         for (i = 0; i < str5.length; i++) {
//                             if (Kuroshiro.Util.isHiragana(str5[i]) || Kuroshiro.Util.isKatakana(str5[i])) {
//                                 strResult.push({ value: str5[i], furi: "" });
//                             }
//                             else {
//                                 if (i == 0) {

//                                 }
//                                 else {
//                                     var ss = str5[i].split(/c|b/);
//                                     strResult.push({ value: ss[0], furi: ss[1] });
//                                 }
//                             }
//                         }
//                         const newExample = new WordExample({ word_id: newWord._id, jp: strResult, vn: vn });
//                         newExample.save();

//                     })
//             }
//         }

//     }

// }