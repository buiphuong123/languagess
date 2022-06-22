const Grammar = require('../models/grammar.model.js');
const Example = require('../models/example.model');
const MemGrammar = require('../models/memGrammar.model');
var ObjectId = require('mongodb').ObjectID;
const Kuroshiro = require('kuroshiro');
const KuromojiAnalyzer = require('kuroshiro-analyzer-kuromoji');
const request = require('request');
// const cheerio = require('cheerio');
const axios = require('axios');
const Comment = require('../models/comment.model.js');

// const createGrammar = async (req, res) => {
//     const { data } = req.body;
//     try {
//         const newGrammars = await Grammar.insertMany(data);
//         return res.json({ code: 1, grammar: newGrammars });
//     } catch (error) {
//         return res.json({ code: 0, error: "Netword error" });
//     }
// }

const createGrammar = async (req, res) => {
    const { grammar, lession, level, translation, structGrammar, indiGrammar, meanGrammar, exampleGrammar } = req.body;
    let newExample;
    console.log(grammar, lession, level, translation, structGrammar, indiGrammar, meanGrammar, exampleGrammar);
    const newGrammar = new Grammar({ grammar, level, lession, translation, structure: structGrammar, mean: meanGrammar, indication: indiGrammar });
    await newGrammar.save();
    if (exampleGrammar.length !== 0) {
        for (j = 0; j < exampleGrammar.length; j++) {
            const grammar_id = newGrammar._id;
            const jp = exampleGrammar[j].jp;
            const vn = exampleGrammar[j].vn;
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
                    console.log('vao tach example');
                    newExample = new Example({ grammar_id, jp: strResult, vn });
                    console.log(newExample);
                    newExample.save();

                })
        }
    }
    return res.json({ message: 'Tao grammar thanh cong' });
}

const GrammarofId = async (req, res) => {
    Grammar.aggregate([
        {
            $lookup: {
                from: "examples",
                localField: "_id",
                foreignField: "grammar_id",
                as: "example"
            }
        }
    ], function (err, result) {
        if (err) {
            res.json({ code: 0, error: 'take data error' });
        }
        return res.json({ code: 1, grammar: result });
    })
}

const createMemGrammar = async (req, res) => {
    const { user_id, grammar_id } = req.body;
    const grammar = await MemGrammar.findOne({ user_id, grammar_id });
    if (grammar) {
        MemGrammar.findOneAndRemove({ user_id, grammar_id }, function (err) {
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
        const newMem = new MemGrammar({ user_id, grammar_id });
        await newMem.save(function (error, newMem) {
            if (error) {
                return res.json({ code: 0, error: error });
            }
            else {
                console.log('memerize success');
                return res.json({ code: 1, success: 'memerize success', nemGrammar: newMem });

            }
        })
    }

    // else{
    //     console.log('chua ton tai');
    // }
    // await newMem.save(function (error, newMem ) {
    //     if(error) {
    //         return res.json({ code: 0, error: error});
    //     }
    //     else {
    //         return res.json({ code: 1, success: 'memerize success', nemGrammar: newMem});
    //     }
    // })
}

const getNameGrammar = async (req, res) => {
    const {level} = req.body;
    const grammar = await Grammar.find({level: level});
    return res.json(grammar );
}

const getGrammar = async (req, res) => {
    const { id } = req.body;
    console.log(id);
    Grammar.aggregate([
        // {
        //     $lookup: {
        //         from: "examples",
        //         localField: "_id",
        //         foreignField: "grammar_id",
        //         as: "example"
        //     }
        // },
        {
            $lookup: {
                from: "memgrammars",
                let: { user: "$user_id", idd: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$user_id", ObjectId(id)] },
                                    { $eq: ["$$idd", "$grammar_id"] }
                                ]
                            }
                        }
                    },
                    { $project: { isMem: 1, _id: 0 } }
                ],
                as: "memerizes"
            }
        },

    ], function (err, result) {
        if (err) {
            res.json({ code: 0, error: 'take data error' });
        }
        return res.json({ code: 1, grammar: result });
    })

}

const furihira = async (req, res) => {
    const kuroshiro = new Kuroshiro();
    const array = ["先輩", "尊重"];
    console.log('array 0 va 1 lan luot la ', array[0], array[1]);
    const strResult = [];
    let i;
    for (i = 0; i < array.length; i++) {
        kuroshiro.init(new KuromojiAnalyzer())
            .then(function () {
                return kuroshiro.convert(array[i], { mode: "furigana", to: "hiragana" });
            })
            .then(function (result) {
                console.log('result la ', result);
                var str1 = result.replaceAll("<ruby>", "a");
                var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
                var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
                var str4 = str3.replaceAll("</ruby>", "m");
                var str5 = str4.split(/a|m/);
                console.log('str5 la ', str5);
                strResult.push({ value: result });

            })
    }
    return res.json(strResult);
}
const subKanji = async (req, res) => {
    const kuroshiro = new Kuroshiro();
    kuroshiro.init(new KuromojiAnalyzer())
        .then(function () {
            return kuroshiro.convert("感じ取れたら手を繋ごう", { mode: "furigana", to: "hiragana" });
        })
        .then(function (result) {
            // "<ruby>感<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>じ<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>れたら<ruby>手<rp>(</rp><rt>て</rt><rp>)</rp></ruby>を<ruby>繋<rp>(</rp><rt>つな</rt><rp>)</rp></ruby>ごう"
            var str1 = result.replaceAll("<ruby>", "a");
            var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
            var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
            var str4 = str3.replaceAll("</ruby>", "m");
            var str5 = str4.split(/a|m/);
            const strResult = [];
            var i;
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

            return res.json(strResult);
        })
}

const subKanjiExampleGrammar = (title) => {
    const kuroshiro = new Kuroshiro();
    kuroshiro.init(new KuromojiAnalyzer())
        .then(function () {
            return kuroshiro.convert(title, { mode: "furigana", to: "hiragana" });
        })
        .then(function (result) {
            // "<ruby>感<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>じ<ruby>取<rp>(</rp><rt>と</rt><rp>)</rp></ruby>れたら<ruby>手<rp>(</rp><rt>て</rt><rp>)</rp></ruby>を<ruby>繋<rp>(</rp><rt>つな</rt><rp>)</rp></ruby>ごう"
            var str1 = result.replaceAll("<ruby>", "a");
            var str2 = str1.replaceAll("</rt><rp>)</rp>", "b");
            var str3 = str2.replaceAll("<rp>(</rp><rt>", "c");
            var str4 = str3.replaceAll("</ruby>", "m");
            var str5 = str4.split(/a|m/);
            const strResult = [];
            var i;
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

            return strResult;
        })
}

const createExample = async (req, res) => {
    const { data } = req.body;
    var j;
    for (j = 0; j < data.length; j++) {
        const grammar_id = data[j].grammar_id
        const jp = data[j].jp;
        const vn = data[j].vn;
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
                const newExample = new Example({ grammar_id, jp: strResult, vn });
                newExample.save();

            })
    }
    return res.json("success");
}

const dataGrammar = async (req, res) => {
    axios.get('https://vi.mazii.net/api/jlptgrammar/2/30/18', {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            const data = response.data.results;
            for (var i = 0; i < data.length; i++) {
                axios.get(`https://vi.mazii.net/api/grammar/${data[i].id}/javi`, {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                })
                    .then(async (response) => {
                        const grammars = response.data.grammar;
                        const grammar = new Grammar({ level: grammars.level.slice(-1), grammar: grammars.title, uses: grammars.usages });
                        await grammar.save();
                        console.log('save success');
                    })
            }
        })
        .catch(function (error) {
            throw error;
        })
}

const furiGrammar = async (req, res) => {
    const grammar = await Grammar.find();
    for (var i = 0; i < grammar.length; i++) {
        const use = grammar[i].uses;
        for (var j = 0; j < use.length; j++) {
            const example = use[j].examples;
            for (var k = 0; k < example.length; k++) {
                const furi = subKanjiExampleGrammar(example[k].content);
                example[k].content = furi;
                await grammar[i].save;
                console.log('save success');
            }
        }
    }
}

const countGr = async(req, res) => {
    const grammar = await Grammar.find({ level: 3});
    return res.json(grammar.length);
}

const createLessionGrammar = async(req, res) => {
    var lession =1;
    const grammar = await Grammar.find({level : 2});
    for(var i=0; i<grammar.length;i++) {
        if(i>= 8*(lession-1) && i<=8*lession) {
            grammar[i].lession = lession;
            await grammar[i].save();
            console.log('save success');
        }
        else if(i>8*lession) {
            lession = lession+1;
        }
    }
    console.log('ket thuc');
}

const deleteGrammar = async(req, res) => {
    const {id} = req.body;
    Grammar.findOneAndRemove({_id: id}, function(err) {
        if(error) {
            console.log(err);
            return res.json({message: 'remove err'});
        }
        else {
            return res.json({message: 'remove success'});
        }
    })

}

const accpetCommentGrammar = async(req, res) => {
    const { list } = req.body;
    for (var i = 0; i < list.length; i++) {
        const comment = await Comment.findOne({ _id: list[i] });
        if (comment) {
            comment.review = 1;
            await comment.save();
            
        }
    }
    return res.json({mess: 'accept success'});
}
const refuseCommentGrammar = async(req, res) => {
    const { list } = req.body;
    for (var i = 0; i < list.length; i++) {
        const comment = await Comment.findOne({ _id: list[i] });
        if (comment) {
            comment.review = 0;
            await comment.save();
            
        }
    }
    return res.json({mess: 'accept success'});
}


module.exports = {
    subKanji,
    createGrammar,
    getGrammar,
    createExample,
    GrammarofId,
    createMemGrammar,
    getNameGrammar,
    furihira,
    dataGrammar,
    furiGrammar,
    countGr,
    createLessionGrammar,
    deleteGrammar,
    accpetCommentGrammar,
    refuseCommentGrammar
};