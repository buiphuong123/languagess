const axios = require('axios');
const cheerio = require('cheerio');
const request = require('request');
const Kanji = require('../models/kanji/kanji.model');
const User = require('../models/user.model');
const KanjiLike = require('../models/kanji/kanjilike.model');
const KanjiMem = require('../models/kanji/kanjimem.model');
const KanjiComment = require('../models/kanji/kanjicomment.model');

const getKanji = async (req, res) => {
    var { id } = req.body;
    Kanji.aggregate([
        {
            $lookup: {
                from: "kanjilikes",
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
                                        { $eq: ["$$idd", "$kanjiId"] }
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
                from: "kanjimems",
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
                                        { $eq: ["$$idd", "$kanjiId"] }
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
            res.json({ code: 1, kanjiData: data });
        }
    })

}

const createMemKanji = async (req, res) => {
    const { userId, kanjiId } = req.body;
    const kanji = await KanjiMem.findOne({ userId, kanjiId });
    if (kanji) {
        KanjiMem.findOneAndRemove({ userId, kanjiId }, function (err) {
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
        const newMem = new KanjiMem({ userId, kanjiId });
        await newMem.save(function (error, newMem) {
            if (error) {
                return res.json({ code: 0, error: error });
            }
            else {
                console.log('memerize success');
                return res.json({ code: 1, success: 'memerize success', nemKanji: newMem });

            }
        })
    }

}

const createLikeKanji = async (req, res) => {
    const { userId, kanjiId } = req.body;
    const kanji = await KanjiLike.findOne({ userId, kanjiId });
    if (kanji) {
        KanjiLike.findOneAndRemove({ userId, kanjiId }, function (err) {
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
        const newLike = new KanjiLike({ userId, kanjiId });
        await newLike.save(function (error, newLike) {
            if (error) {
                return res.json({ code: 0, error: error });
            }
            else {
                console.log('like success');
                return res.json({ code: 1, success: 'like success', likeKanji: newLike });

            }
        })
    }

}

const compDetailKanji = async (req, res) => {
    axios.post('https://vi.mazii.net/api/jlptkanji', {
        "language": "vn",
        "query": 2,
        "limit": 100
    }, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then(async (response) => {
            // return res.json(response.data.results.length);
            const data = response.data.results;
            for (var i = 0; i < data.length; i++) {
                const kanji = await Kanji.findOne({ kanji: data[i].kanji });
                if (kanji) {
                    console.log('co roi');
                }
                else {
                    const level = data[i].level;
                    console.log(level);
                    const kanji = data[i].kanji;
                    const mean = data[i].mean;
                    const kanji_kun = data[i].kun;
                    const kanji_on = data[i].on;
                    const detail = data[i].detail;
                    const compDetail = data[i].compDetail;
                    axios.post('https://vi.mazii.net/api/search', {
                        "dict": "javi",
                        "query": kanji,
                        "type": "kanji"
                    })
                        .then(async (response) => {
                            const datakk = response.data.results;
                            const example_on = datakk[0].example_on;
                            const example_kun = datakk[0].example_kun;
                            // console.log(level, kanji, mean, kanji_kun, kanji_on, detail, example_kun, example_on);
                            newKanji = new Kanji({ kanji, level, mean, kanji_on, kanji_kun, detail, example_on, example_kun, compDetail });
                            await newKanji.save({ checkKeys: false });
                            console.log('sucess');
                        })
                }
            }
            console.log('ket thuc');
        })
}

const countKanji = async (req, res) => {
    const kanji = await Kanji.find();
    const count = kanji.filter(e => parseInt(e.level, 10) === 2).length; //n3 367=> 313 n2 373=> 271
    return res.json(count);
}

const dataKanji = async (req, res) => {
    var newKanji;
    axios.post('https://vi.mazii.net/api/jlptkanji', {
        "language": "vn",
        "query": 2,
        "limit": 400
    }, {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then(async(response) => {
            // return res.json(response.data.results.length);
            const data = response.data.results;
            for (var i = 0; i < data.length; i++) {
                const find = await Kanji.findOne({kanji:data[i].kanji });
                if (!find) {
                    const level = data[i].level;
                    const kanji = data[i].kanji;
                    const mean = data[i].mean;
                    const kanji_kun = data[i].kun;
                    const kanji_on = data[i].on;
                    const detail = data[i].detail;
                    axios.post('https://vi.mazii.net/api/search', {
                        "dict": "javi",
                        "query": kanji,
                        "type": "kanji"
                    })
                        .then(async (response) => {
                            const datakk = response.data.results;
                            const example_on = datakk[0].example_on;
                            const example_kun = datakk[0].example_kun;
                            // console.log(level, kanji, mean, kanji_kun, kanji_on, detail, example_kun, example_on);
                            newKanji = new Kanji({ kanji, level, mean, kanji_on, kanji_kun, detail, example_on, example_kun });
                            await newKanji.save({ checkKeys: false });
                            console.log('sucess');
                        })
                }
                else {
                    console.log('co roi');
                }

            }
        })
}

const findType = async (req, res) => {
    const kanji = await Kanji.findOne({ kanji: "名" });
    return res.json(kanji.compDetail[0].w);
}
const countLevelKanji = async(req, res) => {
    const kanji = await Kanji.find({level: 2});
    // return res.json(kanji.length);
    for(var i=200;i<kanji.length;i++) {
        // console.log(kanji[i].lession);
        if(kanji[i].lession=== undefined) {
            kanji[i].lession = 27;
            await kanji[i].save();
            console.log('save success');
        }
    }
    console.log('ket thuc');
}

const setLessionKanji = async (req, res) => {
    // const word = await Word.find({level: 4});
    // return res.json(word.length);
    var lession = 1;
    const kanji = await Kanji.find({ level: 2 });
    for (var i = 0; i < kanji.length; i++) {
        if (i >= 11 * (lession - 1) && i <= 11 * lession) {
            kanji[i].lession = lession;
            await kanji[i].save();
            console.log('save success');
        }
        else if (i > 11 * lession) {
            lession = lession + 1;
        }
    }
    console.log('ket thuc');
}

const dataExplain = async (req, res) => {
    var ss = [];
    var array = [];
    var value = "";

    request('https://jls.vnjpclub.com/kanji-look-and-learn-bai-32.html', (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(html);
            $('td').each(async (i, el) => {

                const title = $(el)
                    .find('center span')
                    .text()
                var a = {};
                if (title !== "") {
                    value = title;
                }
                var elems = $(el).filter(function () {
                    return $(this).css('padding-right') == '50px';

                });
                // console.log(elems.html() );
                if (elems.html() !== null) {

                    var str1 = elems.html().replaceAll("<font size=\"4\">", "sss ");
                    var str2 = str1.replaceAll("</font>", "mmm");
                    ss = str2.split(/sss|mmm/);

                    a.explain = ss[2];
                    const kanjiFind = await Kanji.findOne({ kanji: value });
                    if (kanjiFind) {
                        a.kanji = kanjiFind.kanji;
                        array.push(a);
                        console.log('push success');
                        for (var i = 0; i < array.length; i++) {
                            const kk = await Kanji.findOne({ kanji: array[i].kanji });
                            if (kk) {
                                kk.explain = array[i].explain;
                                await kk.save();
                                console.log('save success');
                            }
                            else {
                                console.log('khong tim thay');
                            }
                        }


                    }
                    else {
                        console.log('khong tim thay');
                    }
                    // array.push(a);
                    // console.log('ARAY LA', array);
                    // console.log('trc khi set cai khac tach chuoi ne ', kanjiFind);

                    // console.log(kanjiFind, 'sau khi set them explain');
                }
                else {

                }
                // console.log(array);

            })
        }
        else {
            console.log(error);
        }


    })
    if (array.length !== 0) {
        console.log(array);
    }

}
const dataImage = async (req, res) => {
    request('https://jls.vnjpclub.com/kanji-look-and-learn-bai-32.html', (error, response, html) => {
        if (!error && response.statusCode === 200) {
            const $ = cheerio.load(html);
            $('table').each(async (i, el) => {
                const title = $(el)
                    .find('tbody tr td center span')
                    .text();
                const kanjiFind = await Kanji.findOne({ kanji: title });
                if (kanjiFind) {
                    // console.log('tim thay ', kanjiFind);
                    const image = $(el)
                        .find('tbody tr td img')
                        .attr('src');
                    kanjiFind.image = 'https://jls.vnjpclub.com/' + image;
                    await kanjiFind.save();
                    console.log('success');
                }
                else {
                    console.log('khong tim thay');
                }
                // const image = $(el)
                // .find('tbody tr td img')
                // .attr('src');
                // var ss= [];

                // var elems = $(el).filter(function(){
                //             return $(this).css('padding-right') == '50px';

                //        });
                //        if(elems.html() === null) {

                //        }
                //        else {
                //             var str1 = elems.html().replaceAll("<font size=\"4\">" , "sss ");
                //             var str2 = str1.replaceAll("</font>", "mmm");
                //             ss = str2.split(/sss|mmm/);

                //        }

                //    console.log(title, image, ss[2]);
                // console.log(title, image);
            })

            // lay link image
            // $('table').each((i, el) => {
            // const title = $(el)
            // .find('tbody tr td img')
            // .attr('src');
            //     // return res.json(title);
            //     console.log('https://jls.vnjpclub.com/'+title);
            // })


            // lay explain
            // $('td').each((i, el) => {
            //     var elems = $(el).filter(function(){
            //         return $(this).css('padding-right') == '50px';

            //    });
            //    if(elems.html() === null) {

            //    }
            //    else {
            //         var str1 = elems.html().replaceAll("<font size=\"4\">" , "sss ");
            //         var str2 = str1.replaceAll("</font>", "mmm");
            //         var ss = str2.split(/sss|mmm/);
            //         console.log(ss[2]);
            //    }

            // })

            //    const kaka =  $('table td:[style="padding-right:50px"]').text();
            //     console.log(kaka);


            //     var elems = $('td').filter(function(){
            //          return $(this).css('padding-right') == '50px';

            //     });
            //     var str1 = elems.html().replaceAll("<font size=\"4\">" , "sss ");
            //     var str2 = str1.replaceAll("</font>", "mmm");
            //     var ss = str2.split(/sss|mmm/);
            // return res.json( ss); // returns just "test"



            // lay chu kanji
            // $('table').each((i, el) => {
            //     const title = $(el)
            //     .find('tbody tr td center span')
            //     .text();
            //     // return res.json(title);
            //     console.log(title);
            // })
        }
    })


}

const createKanjiComment = async (req, res) => {
    const { kanji_id, user_id, content, requ} = req.body;
    var today = new Date();
    // const user = await User.findOne({ _id: user_id });
    // var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear() + ' ' + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const newComment = new KanjiComment({ kanji_id, user_id: user_id, content, time: today, review: requ });
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

const getDatesInRange = (startDate, endDate) => {
    const date = new Date(startDate.getTime());

    date.setDate(date.getDate() + 1);

    const dates = [];

    while (date < endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }

    return dates;
}

const fixDigit = (val) => {
    return (val < 10 ? '0' : '') + val;
}

const testWordReplace = () => {
    const d1 = new Date('2022-01-30');
    const d2 = new Date('2022-02-07');

    // console.log(getDatesInRange(d1, d2));
    const dates = getDatesInRange(d1, d2);
    for (var i = 0; i < dates.length; i++) {
        console.log(fixDigit(dates[i].getDate()) + '/' + fixDigit(dates[i].getMonth() + 1) + '/' + dates[i].getFullYear());
    }
}

// const countKanji
const deleteKanji = async(req, res) => {
    const {id} = req.body;
    Kanji.findOneAndRemove({_id: id}, function(err) {
        if(error) {
            console.log(err);
            return res.json({message: 'remove err'});
        }
        else {
            return res.json({message: 'remove success'});
        }
    })

}

const accpetCommentKanji = async(req, res) => {
    const { list } = req.body;
    for (var i = 0; i < list.length; i++) {
        const comment = await KanjiComment.findOne({ _id: list[i] });
        if (comment) {
            comment.review = 1;
            await comment.save();
            
        }
    }
    return res.json({mess: 'accept success'});
}
const refuseCommentKanji = async(req, res) => {
    const { list } = req.body;
    for (var i = 0; i < list.length; i++) {
        const comment = await KanjiComment.findOne({ _id: list[i] });
        if (comment) {
            comment.review = 0;
            await comment.save();
            
        }
    }
    return res.json({mess: 'accept success'});
}

module.exports = {
    countLevelKanji,
    dataKanji,
    dataImage,
    dataExplain,
    getKanji,
    createLikeKanji,
    createMemKanji,
    compDetailKanji,
    countKanji,
    setLessionKanji,
    findType,
    createKanjiComment,
    testWordReplace,
    deleteKanji,
    accpetCommentKanji,
    refuseCommentKanji

}