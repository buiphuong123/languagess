const express = require('express');
const User = require('../models/user.model.js');
const nodemailer = require("nodemailer");
var cron = require('node-cron');
const Notification = require('../models/notification.model');
const axios = require('axios');
const Schedule = require('../models/schedule/schedule.model');
var ObjectId = require('mongodb').ObjectID;
const Word = require('../models/word/word.model');
const Grammar = require('../models/grammar.model');
const Kanji = require('../models/kanji/kanji.model');

const fixDigit = (val) => {
    return (val < 10 ? '0' : '') + val;
}
const getDatesInRange = (startDate, endDate) => {
    const date = new Date(startDate.getTime());

    date.setDate(date.getDate());

    const dates = [];

    while (date < endDate) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 1);
        // console.log(date);
    }

    return dates;
}
const remind = async (req, res) => {
    const { nameSchedule, note, datestart, dateend, time, timenoti, method, user_id, action } = req.body;
    // const user_id = user._id;
    console.log(nameSchedule, note, datestart, dateend, time, timenoti, method, user_id, action );
    const user = await User.findOne({ _id: user_id });
    var currentDate = new Date();// o: ngay, 1 thang, 2 nam  0 nam 1 thang 2 ngay
    // const checkdate = fixDigit(currentDate.getDate()) + '/' + fixDigit(currentDate.getMonth() + 1) + '/' + currentDate.getFullYear();
    const checkdate = fixDigit(currentDate.getFullYear()) + '-' + fixDigit(currentDate.getMonth() + 1) + '-' + currentDate.getDate();
    var d1 = datestart.split("-");
    var d2 = dateend.split("-");
    var c = checkdate.split("-");
    var d = time.split(":");
    var from = new Date(d1[0], parseInt(d1[1]) - 1, d1[2]);  // -1 because months are from 0 to 11
    var to = new Date(d2[0], parseInt(d2[1]) - 1, d2[2]);
    var check = new Date(c[0], parseInt(c[1]) - 1, c[2]);
    var hours = d[0];
    var minutes = d[1];

    console.log(hours);
    console.log(minutes);
    if (timenoti === 1) { // thong bao truoc 10 phut
        if (minutes < 10) {
            if (hours === 0) {
                hours = 23;
                minutes = 60 - (10 - minutes);
            }
            else {
                hours = hours - 1
                minutes = 60 - (10 - minutes);
            }
        }
        else {
            minutes = minutes - 10;
        }
    }
    else if (timenoti === 2) {
        if (minutes < 30) {
            if (hours === 0) {
                hours = 23;
                minutes = 60 - (30 - minutes);
            }
            else {
                hours = hours - 1;
                minutes = 60 - (30 - minutes);
            }
        }
        else {
            minutes = minutes - 30;
        }
    }
    else if (timenoti === 3) {
        if (hours === 0) {
            hours = 23;
        }
        else {
            hours = hours - 1;
        }
    }
    console.log(hours, minutes);
    const notiTime = hours + ':' + minutes;
    const d1start = new Date(datestart);
    const d2end = new Date(dateend);
    const dates = getDatesInRange(d1start, d2end);
    console.log(dates);
    var dataWord = undefined;
    var dataGrammar = undefined;
    var dataKanji = undefined;
    var dataPost = undefined;
    var dataVocu = undefined;
    var dataRemind = undefined;
    var newschedule;
    for (var i = 0; i < dates.length; i++) {
        const dateeee = dates[i].getFullYear() + '-' + fixDigit(dates[i].getMonth() + 1) + '-' + fixDigit(dates[i].getDate());
        console.log(dateeee);
        newschedule = new Schedule({ user_id, nameSchedule, note, date: dateeee, time: time, timenoti: notiTime, method: method, typetime: timenoti });
        await newschedule.save();
        dataRemind = newschedule._id;
        console.log('create success');
        // console.log(fixDigit(dates[i].getFullYear() + '-' + fixDigit(dates[i].getMonth() + 1) + '-' + dates[i].getDate());
    }
    if (check >= from && check <= to) {
        console.log('VAO DAY DANG CHAY NE', user);
        cron.schedule(`0 ${minutes} ${hours} * * *`, async () => {
            console.log('running', hours, minutes, user, user_id);
            if (method === 1) {
                var time = new Date();
                console.log('vao send notifi');
                const content = 'nhắc nhở học tập với tên lịch trình: ' + nameSchedule;
                var time = new Date();
                const comment_id = "565656";
                const newNotifi = new Notification({ user_id: user._id, content, time, action, dataWord, dataGrammar, dataKanji, dataPost, dataVocu, dataRemind, typeNoti: "schedule", isRead: false });
                await newNotifi.save(function (err) {
                    if (err) {
                        return res.json({ code: 0, error: err });
                    }
                    else {
                        axios.post('https://fcm.googleapis.com/fcm/send', {
                            // "to": 'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ',
                            "to": user.notifiToken,
                            "notification": {
                                "body": `${user.username} đã đến giờ học rồi`,
                                "title": "language"
                            },
                            "data": {
                                "action": action,
                                "routedata": newschedule,
                                "notification_id": newNotifi._id,
                                "type": "schedule"
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
                                console.log(err);
                            }
                            )
                    }
                })

            }

        });

    }
    // console.log(checkdate);
    // console.log(time.getHours());
    // const start = fixDigit(datestart.getDate()) + '/' + fixDigit(datestart.getMonth() + 1) + '/' + datestart.getFullYear();
    // const end = fixDigit(dateend.getDate()) + '/' + fixDigit(dateend.getMonth() + 1) + '/' + dateend.getFullYear();
    // console.log(start, end);
    // 30 17 * * daily every at 17h30
    // 30 17 * * every week in Tusday in 17h30
    // cron.schedule('30 17 * * Tue', () => {
    //     // console.log('running every minute 1, 2, 4 and 5');
    // });
}

// { "2022-05-08": [{ "height": 58, "name": "Item for 2022-07-30 #0" }, {"height": 50, "name": "Item for 2022-07-30 #1" }], "2022-05-09": [{ "height": 100, "name": "Item for 2022-07-31 #0" }] }
const groupBy = (list, keyGetter) => {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return map;
}
const getSchedule = async (req, res) => {
    const { user_id } = req.body;
    var listschedule = {};

    const schedule = await Schedule.find({ user_id: user_id });
    const grouped = groupBy(schedule, pet => pet.date);
    for (var i = 0; i < schedule.length; i++) {
        const key = schedule[i].date;
        // console.log(key);
        // console.log(grouped.get(key));
        const course = {
            [key]: grouped.get(key),
        };
        Object.assign(listschedule, course);
    }
    console.log(listschedule);
    return res.json({ code: 1, listschedule: listschedule });


    // const pets = [
    //     {type:"Dog", name:"Spot"},
    //     {type:"Cat", name:"Tiger"},
    //     {type:"Dog", name:"Rover"}, 
    //     {type:"Cat", name:"Leo"}
    // ];

    // const grouped = groupBy(pets, pet => pet.date);

    // console.log(grouped.get("")); // -> [{type:"Dog", name:"Spot"}, {type:"Dog", name:"Rover"}]
    // console.log(grouped.get("Cat")); // -> [{type:"Cat", name:"Tiger"}, {type:"Cat", name:"Leo"}]


}

const deleteschedule = (req, res) => {
    const { id } = req.body;
    Schedule.findOneAndRemove({ _id: id }, function (err) {
        if (err) {
            console.log('loi roi');
            return res.json({ message: 'remove err' });
        }
        else {
            return res.json({ message: 'remove success' });
        }
    })
}

const editschedule = async (req, res) => {
    const { id, nameSchedule, note, date, time, timenoti, method } = req.body;
    console.log(id, nameSchedule, note, date, time, timenoti, method);
    const schedule = await Schedule.findOne({ _id: id });
    if (schedule) {
        schedule.nameSchedule = nameSchedule;
        schedule.note = note;
        schedule.date = date;
        schedule.time = time;
        if (time === schedule.time && timenoti === schedule.timenoti) {
            schedule.method = method;
            schedule.typetime = timenoti;
            await schedule.save(function (error, user) {
                if (error) {
                    console.log('error');
                    return res.json({ code: 0, error: 'change password failed' });
                }
                else {
                    console.log('sucess');
                    return res.json({ code: 1, success: 'update success' });
                }
            })
            // console.log('save success');
        }
        else {
            var d = time.split(":");
            var hours = d[0];
            var minutes = d[1];
            if (timenoti === 1) { // thong bao truoc 10 phut
                if (minutes < 10) {
                    if (hours === 0) {
                        hours = 23;
                        minutes = 60 - (10 - minutes);
                    }
                    else {
                        hours = hours - 1
                        minutes = 60 - (10 - minutes);
                    }
                }
                else {
                    minutes = minutes - 10;
                }
            }
            else if (timenoti === 2) {
                if (minutes < 30) {
                    if (hours === 0) {
                        hours = 23;
                        minutes = 60 - (30 - minutes);
                    }
                    else {
                        hours = hours - 1;
                        minutes = 60 - (30 - minutes);
                    }
                }
                else {
                    minutes = minutes - 30;
                }
            }
            else if (timenoti === 3) {
                if (hours === 0) {
                    hours = 23;
                }
                else {
                    hours = hours - 1;
                }
            }
            const notiTime = hours + ':' + minutes;
            schedule.timenoti = notiTime;

        }
        schedule.method = method;
        schedule.typetime = timenoti;
        await schedule.save(function (error, user) {
            if (error) {
                console.log('error');
                return res.json({ code: 0, error: ' failed' });
            }
            else {
                console.log('sucess');
                return res.json({ code: 1, success: 'update success' });
            }
        })


    }
}

const suggesst = async (req, res) => {
    const { now, future, time } = req.body;
    console.log(now, future, time);
    const timeLearn = 2.5;
    var number;
    const n5word = 800;
    const n5grammar = 75;
    const n5kanji = 80;
    const n4word = 700;
    const n4grammar = 100;
    const n4kanji = 200;
    const n3word = 1500;
    const n3grammar = 675;
    const n3kanji = 350;
    const n2word = 3000;
    const n2grammar = 541;
    const n2kanji = 1000;
    const alln5 = n5word + n5grammar + n5kanji;
    const alln4 = n4word + n4grammar + n4kanji;
    const alln3 = n3word + n3grammar + n3kanji;
    const alln2 = n2word + n2grammar + n2kanji;
    timeMinN5 = 150; timeMinN4 = 300; timeMinN3 = 450; timeMinN2 = 600;
    var allfulture;
    var wordfulture;
    var grammarfulture;
    var kanjifulture;
    var timeEnd;
    const listLevel = [];
    if (now === 0) {
        if (future === 5) {
            timeEnd = timeMinN5;
            allfulture = alln5;
            wordfulture = n5word;
            grammarfulture = n5grammar; kanjifulture = n5kanji;
            listLevel.push(5);
        }
        else if (future === 4) {
            timeEnd = timeMinN4;
            allfulture = alln4 + alln5;
            wordfulture = n4word + n5word;
            grammarfulture = n5grammar + n4grammar;
            kanjifulture = n5kanji + n4kanji;
            listLevel.push(5, 4);
        }
        else if (future === 3) {
            timeEnd = timeMinN3;
            allfulture = alln5 + alln4 + alln3;
            wordfulture = n4word + n5word + n3word;
            grammarfulture = n5grammar + n4grammar + n3grammar;
            kanjifulture = n5kanji + n4kanji + n3kanji;
            listLevel.push(5, 4, 3);
        }
        else if (future === 2) {
            timeEnd = timeMinN2;
            allfulture = alln5 + alln4 + alln3 + alln2;
            wordfulture = n4word + n5word + n3word + n2word;
            grammarfulture = n5grammar + n4grammar + n3grammar + n2grammar;
            kanjifulture = n5kanji + n4kanji + n3kanji + n2kanji;
            listLevel.push(5, 4, 3, 2);
        }
    }
    else {
        if (now === 5 && future === 4) {
            timeEnd = timeMinN4 - timeMinN5;
            allfulture = alln4;
            wordfulture = n4word;
            grammarfulture = n4grammar;
            kanjifulture = n4kanji;
            listLevel.push(4);
        }
        else if (now === 5 && future === 3) {
            timeEnd = timeMinN3 - timeMinN5;
            allfulture = alln4 + alln3;
            wordfulture = n4word + n3word;
            grammarfulture = n3grammar + n4grammar;
            kanjifulture = n3kanji + n4kanji;
            listLevel.push(4, 3);
        }
        else if (now === 5 && future === 2) {
            timeEnd = timeMinN2 - timeMinN5;
            allfulture = alln4 + alln3 + alln2;
            wordfulture = n4word + n2word + n3word;
            grammarfulture = n2grammar + n4grammar + n3grammar;
            kanjifulture = n2kanji + n4kanji + n3kanji;
            listLevel.push(4, 3, 2);
        }
        else if (now === 4 && future === 3) {
            timeEnd = timeMinN3 - timeMinN4;
            allfulture = alln3;
            wordfulture = n3word;
            grammarfulture = n3grammar;
            kanjifulture = n3kanji;
            listLevel.push(3);
        }
        else if (now === 4 && future === 2) {
            timeEnd = timeMinN2 - timeMinN4;
            allfulture = alln3 + alln2;
            wordfulture = n2word + n3word;
            grammarfulture = n3grammar + n2grammar;
            kanjifulture = n2kanji + n3kanji;
            listLevel.push(3, 2);
        }
        else if (now === 3 && future === 2) {
            timeEnd = timeMinN2 - timeMinN3;
            allfulture = alln2;
            wordfulture = n2word;
            grammarfulture = n2grammar;
            kanjifulture = n2kanji;
            listLevel.push(2);
        }
        else {
            return res.json({ code: 0, mess: 'trình đọ nhập vào không hợp lệ' });
        }
    }
    if (time < timeEnd) {
        return res.json({ code: 0, mess: 'Mục tiêu không thể thực hiện' });
    }
    else {
        const time1element = time / allfulture;
        number = ((timeLearn - 0.5) / time1element).toFixed();
        const wordNumber = (number * (wordfulture / allfulture)).toFixed();
        const grammarNumber = (number * (grammarfulture / allfulture)).toFixed();
        const kanjiNumber = number - wordNumber - grammarNumber;
        const mess = `Bạn sẽ học ${timeLearn} giờ mỗi ngày, trong đó 30 phút để luyện tập bài cũ, và ${timeLearn - 0.5} giờ để học.
        Mỗi ngày bạn sẽ học ${wordNumber} từ mới, ${grammarNumber} ngữ pháp và ${kanjiNumber} chữ hán.
        Bạn có muốn thực hiện theo kế hoạch của app không?
        `;
        return res.json({ code: 1, mess: mess, listLevel: listLevel, wordNumber, grammarNumber, kanjiNumber });
    }


}


const suggesst1 = async (req, res) => {
    const { now, future, time, user_id } = req.body;
    console.log(now, future, time);
    const schedule = await Schedule.find({ user_id, nameSchedule: "Học theo kế hoạch của app " });
    if (schedule.length !== 0) {
        return res.json({ code: 2, mess: 'Bạn đã thiết lập kế hoạch, vui lòng xóa kế hoạch cũ rồi thiết lập lại' });
    }
    const timeLearn = 2.5;
    var number;
    const n5word = 550//800;
    const n5grammar = 182;
    const n5kanji = 80;
    const n4word = 468 //700;
    const n4grammar = 453;
    const n4kanji = 167 //200;
    const n3word = 1297 //1500;
    const n3grammar = 675;
    const n3kanji = 313//350;
    const n2word = 1261//3000;
    const n2grammar = 541;
    const n2kanji = 271 //1000;
    const alln5 = n5word + n5grammar + n5kanji;
    const alln4 = n4word + n4grammar + n4kanji;
    const alln3 = n3word + n3grammar + n3kanji;
    const alln2 = n2word + n2grammar + n2kanji;
    timeMinN5 = 150; timeMinN4 = 300; timeMinN3 = 450; timeMinN2 = 600;
    var allfulture;
    const result = [];
    var timeEnd;
    const listLevel = [];
    if (now === 0) {
        if (future === 5) {
            timeEnd = timeMinN5;
            allfulture = alln5;
            const a = {};
            a.level = 5;
            a.all = alln5;
            a.word = n5word;
            a.grammar = n5grammar;
            a.kanji = n5kanji;
            listLevel.push(a);
        }
        else if (future === 4) {
            timeEnd = timeMinN4;
            allfulture = alln4 + alln5;
            const a = {};
            a.level = 5;
            a.all = alln5;
            a.word = n5word;
            a.grammar = n5grammar;
            a.kanji = n5kanji;
            listLevel.push(a);
            const b = {};
            b.level = 4;
            b.all = alln4;
            b.word = n4word;
            b.grammar = n4grammar;
            b.kanji = n4kanji;
            listLevel.push(b);
        }
        else if (future === 3) {
            timeEnd = timeMinN3;
            allfulture = alln5 + alln4 + alln3;
            const a = {};
            a.level = 5;
            a.all = alln5;
            a.word = n5word;
            a.grammar = n5grammar;
            a.kanji = n5kanji;
            listLevel.push(a);
            const b = {};
            b.level = 4;
            b.all = alln4;
            b.word = n4word;
            b.grammar = n4grammar;
            b.kanji = n4kanji;
            listLevel.push(b);
            const c = {};
            c.level = 3;
            c.all = alln3;
            c.word = n3word;
            c.grammar = n3grammar;
            c.kanji = n3kanji;
            listLevel.push(c);
        }
        else if (future === 2) {
            timeEnd = timeMinN2;
            allfulture = alln5 + alln4 + alln3 + alln2;
            const a = {};
            a.level = 5;
            a.all = alln5;
            a.word = n5word;
            a.grammar = n5grammar;
            a.kanji = n5kanji;
            listLevel.push(a);
            const b = {};
            b.level = 4;
            b.all = alln4;
            b.word = n4word;
            b.grammar = n4grammar;
            b.kanji = n4kanji;
            listLevel.push(b);
            const c = {};
            c.level = 3;
            c.all = alln3;
            c.word = n3word;
            c.grammar = n3grammar;
            c.kanji = n3kanji;
            listLevel.push(c);
            const d = {};
            d.level = 2;
            d.all = alln2;
            d.word = n2word;
            d.grammar = n2grammar;
            d.kanji = n2kanji;
            listLevel.push(d);
        }
    }
    else {
        if (now === 5 && future === 4) {
            timeEnd = timeMinN4 - timeMinN5;
            allfulture = alln4;
            const a = {};
            a.level = 4;
            a.all = alln4;
            a.word = n4word;
            a.grammar = n4grammar;
            a.kanji = n4kanji;
            listLevel.push(a);
        }
        else if (now === 5 && future === 3) {
            timeEnd = timeMinN3 - timeMinN5;
            allfulture = alln4 + alln3;
            const a = {};
            a.level = 4;
            a.all = alln4;
            a.word = n4word;
            a.grammar = n4grammar;
            a.kanji = n4kanji;
            listLevel.push(a);
            const b = {};
            b.level = 3;
            b.all = alln3;
            b.word = n3word;
            b.grammar = n3grammar;
            b.kanji = n3kanji;
            listLevel.push(b);
        }
        else if (now === 5 && future === 2) {
            timeEnd = timeMinN2 - timeMinN5;
            allfulture = alln4 + alln3 + alln2;
            const a = {};
            a.level = 4;
            a.all = alln4;
            a.word = n4word;
            a.grammar = n4grammar;
            a.kanji = n4kanji;
            listLevel.push(a);
            const b = {};
            b.level = 3;
            b.all = alln3;
            b.word = n3word;
            b.grammar = n3grammar;
            b.kanji = n3kanji;
            listLevel.push(b);
            const c = {};
            c.level = 2;
            c.all = alln2;
            c.word = n2word;
            c.grammar = n2grammar;
            c.kanji = n2kanji;
            listLevel.push(c);
        }
        else if (now === 4 && future === 3) {
            timeEnd = timeMinN3 - timeMinN4;
            allfulture = alln3;
            const a = {};
            a.level = 3;
            a.all = alln3;
            a.word = n3word;
            a.grammar = n3grammar;
            a.kanji = n3kanji;
            listLevel.push(a);
        }
        else if (now === 4 && future === 2) {
            timeEnd = timeMinN2 - timeMinN4;
            allfulture = alln3 + alln2;
            const a = {};
            a.level = 3;
            a.all = alln3;
            a.word = n3word;
            a.grammar = n3grammar;
            a.kanji = n3kanji;
            listLevel.push(a);
            const c = {};
            c.level = 2;
            c.all = alln2;
            c.word = n2word;
            c.grammar = n2grammar;
            c.kanji = n2kanji;
            listLevel.push(c);
        }
        else if (now === 3 && future === 2) {
            timeEnd = timeMinN2 - timeMinN3;
            allfulture = alln2;
            const c = {};
            c.level = 2;
            c.all = alln2;
            c.word = n2word;
            c.grammar = n2grammar;
            c.kanji = n2kanji;
            listLevel.push(c);
        }
        else {
            return res.json({ code: 0, mess: 'trình đọ nhập vào không hợp lệ, mục tiêu phải cao hơn trình độ hiện tại!!' });
        }
    }
    if (time < timeEnd) {
        return res.json({ code: 0, mess: 'Mục tiêu không thể thực hiện, thời gian quá ngắn để có thể thực hiện được mục tiêu!!' });
    }
    else {
        console.log(listLevel);
        for (var i = 0; i < listLevel.length; i++) {
            // console.log('BAT DAU VOI TRINH ', listLevel[i].level);
            const timeee = time * (listLevel[i].all / allfulture); // thời gian học cho từng trình độ 
            const day = (timeee / (timeLearn )).toFixed() * 1;
            // console.log('1 NGÀY HK TONG CONG ', day);// tong so ngay hoc trình do 
            const wordNumber = ((listLevel[i].word) / day).toFixed() * 1;
            const grammarNumber = ((listLevel[i].grammar) / day).toFixed() * 1;
            const kanjiNumber = ((listLevel[i].kanji) / day).toFixed() * 1;
            const a = {};
            a.level = listLevel[i].level;
            a.word = wordNumber;
            a.grammar = grammarNumber;
            a.kanji = kanjiNumber;
            a.day = day;
            result.push(a);
        }
        console.log(result);
        const levelres = result.map(({ level }) => level).toString();
        const dateres = result.map(({ day }) => day).join(" ngày, ");

        var mess = `Để đạt được mục tiêu bạn sẽ phải học trình độ N${levelres} trong thời gian lần lượt là ${dateres} ngày. 
`;
        for (var i = 0; i < result.length; i++) {
            const mee = `Với trình độ N${result[i].level}, mỗi ngày bạn sẽ học ${result[i].word} từ vựng, ${result[i].grammar} ngữ pháp và ${result[i].kanji} hán tự
`;
            mess = mess + mee;
        }
        const kh = "Bạn có muốn thực hiện kế hoạch không?"
        mess = mess + kh;
        console.log(mess);
        // const mess = `Bạn sẽ học ${timeLearn} giờ mỗi ngày, trong đó 30 phút để luyện tập bài cũ, và ${timeLearn - 0.5} giờ để học.
        // Mỗi ngày bạn sẽ học ${wordNumber} từ mới, ${grammarNumber} ngữ pháp và ${kanjiNumber} chữ hán.
        // Bạn có muốn thực hiện theo kế hoạch của app không?
        // `;
        return res.json({ code: 1, result: result, mess: mess });

    }


}
const testSchedule = () => {
    // var day = new Date('Apr 30, 2000');
    // console.log(day); // Apr 30 2000

    // var nextDay = new Date(day);
    // nextDay.setDate(day.getDate() + 1);
    // console.log(nextDay); // May 01 2000   
    var today = new Date("2022-07-31T13:49:26.461Z");
    var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
    console.log(tomorrow);
}

const startLearn = async (req, res) => {
    const { result, user_id, method, timenoti, time } = req.body;
    console.log(result);
    var d = time.split(":");
    var hours = d[0];
    var minutes = d[1];

    if (timenoti === 1) { // thong bao truoc 10 phut
        if (minutes < 10) {
            if (hours === 0) {
                hours = 23;
                minutes = 60 - (10 - minutes);
            }
            else {
                hours = hours - 1
                minutes = 60 - (10 - minutes);
            }
        }
        else {
            minutes = minutes - 10;
        }
    }
    else if (timenoti === 2) {
        if (minutes < 30) {
            if (hours === 0) {
                hours = 23;
                minutes = 60 - (30 - minutes);
            }
            else {
                hours = hours - 1;
                minutes = 60 - (30 - minutes);
            }
        }
        else {
            minutes = minutes - 30;
        }
    }
    else if (timenoti === 3) {
        if (hours === 0) {
            hours = 23;
        }
        else {
            hours = hours - 1;
        }
    }
    const notiTime = hours + ':' + minutes;
    var date = new Date();
    var dategrammar = new Date();
    var datekanji = new Date();
    console.log(date);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    var nameSchedule = "Học theo kế hoạch của app ";
    console.log(day, month, year);

    for (var i = 0; i < result.length; i++) {
        console.log('LEVEL ', result[i].level);
        console.log('WORD NE');
        const wordlevel = await Word.find({ level: result[i].level });
        const maxword = Math.max(...wordlevel.map(w => w.lession ?? 1));
        const tbword = (wordlevel.length / maxword).toFixed() * 1;
        var tuthuabuasau = 0;
        for (var k = 0; k < maxword; k++) {
            console.log('bai ', k + 1);

            // var hoanthanh1bai = ()
            if (tuthuabuasau === 0) {
                var word1bai = tbword;
                var sotuphaihoc = result[i].word;
                while (sotuphaihoc < word1bai && Math.floor(sotuphaihoc / result[i].word) === 1) {
                    const dateeee = fixDigit(date.getFullYear()) + '-' + fixDigit(date.getMonth() + 1) + '-' + fixDigit(date.getDate());
                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) tu`);
                    // const schedule = new Schedule({user_id, })
                    const data = [];
                    const a = {};
                    a.type = "word";
                    a.level = result[i].level;
                    a.lession = k + 1;
                    a.number = sotuphaihoc;
                    data.push(a);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        await schedule.save();
                        console.log('save success', schedule.data);
                    }
                    else {
                        const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: method });
                        await schedule.save();
                        console.log('save success');
                    }
                    console.log(user_id, nameSchedule, a, dateeee);
                    word1bai = word1bai - sotuphaihoc
                    date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                }
                tuthuabuasau = word1bai;

            }

            else if (tuthuabuasau > 0) {
                var word1bai = tbword;
                var sotuphaihoc = result[i].word;

                if (tuthuabuasau < result[i].word) {

                    sotuphaihoc = sotuphaihoc - tuthuabuasau;
                    const dateeee = fixDigit(date.getFullYear()) + '-' + fixDigit(date.getMonth() + 1) + '-' + fixDigit(date.getDate());
                    console.log(`${dateeee} hoc bai ${k} (${tuthuabuasau}) tu`);

                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) tu`);
                    const data = [];
                    const a = {};
                    a.type = "word";
                    a.level = result[i].level;
                    a.lession = k;
                    a.number = tuthuabuasau;
                    data.push(a);
                    const b = {};
                    b.type = "word";
                    b.level = result[i].level;
                    b.lession = k + 1;
                    b.number = sotuphaihoc;
                    data.push(b);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        schedule.data.push(b);
                        await schedule.save();
                        console.log('save success ', schedule.data);
                    }
                    else {
                        const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        await schedule.save();
                        console.log('save success');
                    }
                    tuthuabuasau = tbword - sotuphaihoc;
                    date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                    while (tuthuabuasau < word1bai && Math.floor(tuthuabuasau / result[i].word) !== 0) {
                        const dateeee = fixDigit(date.getFullYear()) + '-' + fixDigit(date.getMonth() + 1) + '-' + fixDigit(date.getDate());
                        console.log(`${dateeee} hoc bai ${k + 1} (${result[i].word}) tu`);
                        const data = [];
                        const a = {};
                        a.type = "word";
                        a.level = result[i].level;
                        a.lession = k + 1;
                        a.number = result[i].word;
                        data.push(a);
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            await schedule.save();
                            console.log('save success');
                        }
                        date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasau = tuthuabuasau - result[i].word;


                    }
                }
                else {
                    // tu thua sau la 22
                    var word1bai = tbword;
                    var sotuphaihoc = result[i].word;
                    while (tuthuabuasau < word1bai && Math.floor(tuthuabuasau / result[i].word) !== 0) {
                        const dateeee = fixDigit(date.getFullYear()) + '-' + fixDigit(date.getMonth() + 1) + '-' + fixDigit(date.getDate());
                        console.log(`${dateeee} hoc bai ${k} (${sotuphaihoc}) tu`);
                        const data = [];
                        const a = {};
                        a.type = "word";
                        a.level = result[i].level;
                        a.lession = k;
                        a.number = sotuphaihoc;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            await schedule.save();
                            console.log('save success');
                        }
                        date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasau = tuthuabuasau - sotuphaihoc;


                    }
                    date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                    // type =1;
                }

            }
        }

        console.log('GRAMMAR NE');
        const grammarlevel = await Grammar.find({ level: result[i].level });
        const maxgrammar = Math.max(...grammarlevel.map(w => w.lession ?? 1));
        const tbgrammar = (grammarlevel.length / maxgrammar).toFixed() * 1;
        var tuthuabuasaugrammar = 0;
        for (var k = 0; k < maxgrammar; k++) {
            console.log('bai ', k + 1);

            // var hoanthanh1bai = ()
            if (tuthuabuasaugrammar === 0) {
                var word1bai = tbgrammar;
                var sotuphaihoc = result[i].grammar;
                while (sotuphaihoc < word1bai && Math.floor(sotuphaihoc / result[i].grammar) === 1) {
                    const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) grammar`);

                    const data = [];
                    const a = {};
                    a.type = "grammar";
                    a.level = result[i].level;
                    a.lession = k + 1;
                    a.number = sotuphaihoc;
                    data.push(a);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        await schedule.save();
                        console.log('save success', schedule.data);
                    }
                    else {
                        const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        await schedule.save();
                        console.log('save success');
                    }

                    word1bai = word1bai - sotuphaihoc
                    dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                }
                tuthuabuasaugrammar = word1bai;

            }

            else if (tuthuabuasaugrammar > 0) {
                var word1bai = tbgrammar;
                var sotuphaihoc = result[i].grammar;

                if (tuthuabuasaugrammar < result[i].grammar) {

                    sotuphaihoc = sotuphaihoc - tuthuabuasaugrammar;
                    const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                    console.log(`${dateeee} hoc bai ${k} (${tuthuabuasaugrammar}) grammar`);

                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) grammar`);
                    const data = [];
                    const a = {};
                    a.type = "grammar";
                    a.level = result[i].level;
                    a.lession = k;
                    a.number = tuthuabuasaugrammar;
                    data.push(a);
                    const b = {};
                    b.type = "grammar";
                    b.level = result[i].level;
                    b.lession = k + 1;
                    b.number = sotuphaihoc;
                    data.push(b);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        schedule.data.push(b);
                        await schedule.save();
                        console.log('save success ', schedule.data);
                    }
                    else {
                        const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        await schedule.save();
                        console.log('save success');
                    }
                    tuthuabuasaugrammar = tbgrammar - sotuphaihoc;
                    dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                    while (tuthuabuasaugrammar < word1bai && Math.floor(tuthuabuasaugrammar / result[i].grammar) !== 0) {
                        const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                        console.log(`${dateeee} hoc bai ${k + 1} (${result[i].grammar}) grammar`);

                        const data = [];
                        const a = {};
                        a.type = "grammar";
                        a.level = result[i].level;
                        a.lession = k + 1;
                        a.number = result[i].grammar;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            await schedule.save();
                            console.log('save success');
                        }

                        dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasaugrammar = tuthuabuasaugrammar - result[i].grammar;


                    }
                }
                else {
                    var word1bai = tbgrammar;
                    var sotuphaihoc = result[i].grammar;
                    while (tuthuabuasaugrammar < word1bai && Math.floor(tuthuabuasaugrammar / result[i].grammar) !== 0) {
                        const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                        console.log(`${dateeee} hoc bai ${k} (${sotuphaihoc}) tu`);

                        const data = [];
                        const a = {};
                        a.type = "grammar";
                        a.level = result[i].level;
                        a.lession = k;
                        a.number = sotuphaihoc;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            await schedule.save();
                            console.log('save success');
                        }

                        dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasaugrammar = tuthuabuasaugrammar - sotuphaihoc;


                    }
                    dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                }

            }
        }

        console.log('KANJI NE');
        const kanjilevel = await Kanji.find({ level: result[i].level });
        const maxkanji = Math.max(...kanjilevel.map(w => w.lession ?? 1));
        const tbkanji = (kanjilevel.length / maxkanji).toFixed() * 1;
        var tuthuabuasaukanji = 0;
        for (var k = 0; k < maxkanji; k++) {
            console.log('bai ', k + 1);

            // var hoanthanh1bai = ()
            if (tuthuabuasaukanji === 0) {
                var word1bai = tbkanji;
                var sotuphaihoc = result[i].kanji;
                console.log(word1bai);
                while (sotuphaihoc < word1bai && Math.floor(sotuphaihoc / result[i].kanji) === 1) {
                    const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) kanji`);

                    const data = [];
                    const a = {};
                    a.type = "kanji";
                    a.level = result[i].level;
                    a.lession = k + 1;
                    a.number = sotuphaihoc;
                    data.push(a);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        await schedule.save();
                        console.log('save success', schedule.data);
                    }
                    else {
                        const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        await schedule.save();
                        console.log('save success');
                    }

                    word1bai = word1bai - sotuphaihoc
                    datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                }
                tuthuabuasaukanji = word1bai;

            }

            else if (tuthuabuasaukanji > 0) {
                var word1bai = tbkanji;
                var sotuphaihoc = result[i].kanji;

                if (tuthuabuasaukanji < result[i].kanji) {

                    sotuphaihoc = sotuphaihoc - tuthuabuasaukanji;
                    const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                    console.log(`${dateeee} hoc bai ${k} (${tuthuabuasaukanji}) kanji`);

                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) kanji`);

                    const data = [];
                    const a = {};
                    a.type = "kanji";
                    a.level = result[i].level;
                    a.lession = k;
                    a.number = tuthuabuasaukanji;
                    data.push(a);
                    const b = {};
                    b.type = "kanji";
                    b.level = result[i].level;
                    b.lession = k + 1;
                    b.number = sotuphaihoc;
                    data.push(b);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        schedule.data.push(b);
                        await schedule.save();
                        console.log('save success ', schedule.data);
                    }
                    else {
                        const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        await schedule.save();
                        console.log('save success');
                    }

                    tuthuabuasaukanji = tbkanji - sotuphaihoc;
                    datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                    while (tuthuabuasaukanji < word1bai && Math.floor(tuthuabuasaukanji / result[i].kanji) !== 0) {
                        const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                        console.log(`${dateeee} hoc bai ${k + 1} (${result[i].kanji}) kanji`);

                        const data = [];
                        const a = {};
                        a.type = "kanji";
                        a.level = result[i].level;
                        a.lession = k + 1;
                        a.number = result[i].kanji;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            await schedule.save();
                            console.log('save success');
                        }

                        datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasaukanji = tuthuabuasaukanji - result[i].kanji;


                    }
                }
                else {
                    var word1bai = tbkanji;
                    var sotuphaihoc = result[i].kanji;
                    while (tuthuabuasaukanji <= word1bai && Math.floor(tuthuabuasaukanji / result[i].kanji) !== 0) {
                        const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                        console.log(`${dateeee} hoc bai ${k} (${sotuphaihoc}) kanji`);

                        const data = [];
                        const a = {};
                        a.type = "kanji";
                        a.level = result[i].level;
                        a.lession = k;
                        a.number = sotuphaihoc;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            await schedule.save();
                            console.log('save success');
                        }



                        datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasaukanji = tuthuabuasaukanji - sotuphaihoc;


                    }
                    datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                }

            }
        }

        if (date > dategrammar && date > datekanji) {
            dategrammar = date;
            datekanji = date;
        }
        else if (dategrammar > date && dategrammar > datekanji) {
            date = dategrammar;
            datekanji = dategrammar;
        }
        else if (datekanji > date && datekanji > dategrammar) {
            date = datekanji;
            dategrammar = datekanji;
        }

    }
    return res.json({ code: 1 });
}

const startLearnTest = async (req, res) => {
    const { result, user_id } = req.body;
    var date = new Date();
    var dategrammar = new Date();
    var datekanji = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    var nameSchedule = "Học theo kế hoạch của app ";
    console.log(day, month, year);

    for (var i = 0; i < 1; i++) {
        console.log('LEVEL ', result[i].level);
        console.log('WORD NE');
        const wordlevel = await Word.find({ level: result[i].level });
        const maxword = Math.max(...wordlevel.map(w => w.lession ?? 1));
        const tbword = (wordlevel.length / maxword).toFixed() * 1;
        var tuthuabuasau = 0;
        for (var k = 0; k < maxword; k++) {
            console.log('bai ', k + 1);

            // var hoanthanh1bai = ()
            if (tuthuabuasau === 0) {
                var word1bai = tbword;
                var sotuphaihoc = result[i].word;
                while (sotuphaihoc < word1bai && Math.floor(sotuphaihoc / result[i].word) === 1) {
                    const dateeee = fixDigit(date.getFullYear()) + '-' + fixDigit(date.getMonth() + 1) + '-' + fixDigit(date.getDate());
                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) tu`);
                    // const schedule = new Schedule({user_id, })
                    const data = [];
                    const a = {};
                    a.type = "word";
                    a.level = result[i].level;
                    a.lession = k + 1;
                    a.number = sotuphaihoc;
                    data.push(a);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        await schedule.save();
                        console.log('save success', schedule.data);
                    }
                    else {
                        // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: method });
                        // await schedule.save();
                        console.log('save success');
                    }
                    console.log(user_id, nameSchedule, a, dateeee);
                    word1bai = word1bai - sotuphaihoc
                    date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                }
                tuthuabuasau = word1bai;

            }

            else if (tuthuabuasau > 0) {
                var word1bai = tbword;
                var sotuphaihoc = result[i].word;

                if (tuthuabuasau < result[i].word) {

                    sotuphaihoc = sotuphaihoc - tuthuabuasau;
                    const dateeee = fixDigit(date.getFullYear()) + '-' + fixDigit(date.getMonth() + 1) + '-' + fixDigit(date.getDate());
                    console.log(`${dateeee} hoc bai ${k} (${tuthuabuasau}) tu`);

                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) tu`);
                    const data = [];
                    const a = {};
                    a.type = "word";
                    a.level = result[i].level;
                    a.lession = k;
                    a.number = tuthuabuasau;
                    data.push(a);
                    const b = {};
                    b.type = "word";
                    b.level = result[i].level;
                    b.lession = k + 1;
                    b.number = sotuphaihoc;
                    data.push(b);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        schedule.data.push(b);
                        await schedule.save();
                        console.log('save success ', schedule.data);
                    }
                    else {
                        // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        // await schedule.save();
                        console.log('save success');
                    }
                    tuthuabuasau = tbword - sotuphaihoc;
                    date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                    while (tuthuabuasau < word1bai && Math.floor(tuthuabuasau / result[i].word) !== 0) {
                        const dateeee = fixDigit(date.getFullYear()) + '-' + fixDigit(date.getMonth() + 1) + '-' + fixDigit(date.getDate());
                        console.log(`${dateeee} hoc bai ${k + 1} (${result[i].word}) tu`);
                        const data = [];
                        const a = {};
                        a.type = "word";
                        a.level = result[i].level;
                        a.lession = k + 1;
                        a.number = result[i].word;
                        data.push(a);
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            // await schedule.save();
                            console.log('save success');
                        }
                        date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasau = tuthuabuasau - result[i].word;


                    }
                }
                else {
                    // tu thua sau la 22
                    var word1bai = tbword;
                    var sotuphaihoc = result[i].word;
                    while (tuthuabuasau < word1bai && Math.floor(tuthuabuasau / result[i].word) !== 0) {
                        const dateeee = fixDigit(date.getFullYear()) + '-' + fixDigit(date.getMonth() + 1) + '-' + fixDigit(date.getDate());
                        console.log(`${dateeee} hoc bai ${k} (${sotuphaihoc}) tu`);
                        const data = [];
                        const a = {};
                        a.type = "word";
                        a.level = result[i].level;
                        a.lession = k;
                        a.number = sotuphaihoc;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            // await schedule.save();
                            console.log('save success');
                        }
                        date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasau = tuthuabuasau - sotuphaihoc;


                    }
                    date = new Date(date.getTime() + (24 * 60 * 60 * 1000));
                    // type =1;
                }

            }
        }

        console.log('GRAMMAR NE');
        const grammarlevel = await Grammar.find({ level: result[i].level });
        const maxgrammar = Math.max(...grammarlevel.map(w => w.lession ?? 1));
        const tbgrammar = (grammarlevel.length / maxgrammar).toFixed() * 1;
        var tuthuabuasaugrammar = 0;
        for (var k = 0; k < maxgrammar; k++) {
            console.log('bai ', k + 1);
            var tbbb = tbgrammar;
            while(tuthuabuasaugrammar === 0 && tbbb%result[i].grammar === 0 && tbbb !==0) {
                const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                const data = [];
                const a = {};
                a.type = "grammar";
                a.level = result[i].level;
                a.lession = k + 1;
                a.number = result[i].grammar;
                data.push(a);
                console.log(`${dateeee} hoc bai ${k + 1} (${result[i].grammar}) grammar`);
                const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        await schedule.save();
                        console.log('save success', schedule.data);
                    }
                    else {
                        // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        // await schedule.save();
                        console.log('save success');
                    }
                    tbbb = tbbb - result[i].grammar;
                    dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
            }
            // var hoanthanh1bai = ()
            if (tuthuabuasaugrammar === 0 &tbgrammar%result[i].grammar !== 0) {
                var word1bai = tbgrammar;
                var sotuphaihoc = result[i].grammar;
                while (sotuphaihoc < word1bai && Math.floor(sotuphaihoc / result[i].grammar) === 1) {
                    const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) grammar`);

                    const data = [];
                    const a = {};
                    a.type = "grammar";
                    a.level = result[i].level;
                    a.lession = k + 1;
                    a.number = sotuphaihoc;
                    data.push(a);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        await schedule.save();
                        console.log('save success', schedule.data);
                    }
                    else {
                        // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        // await schedule.save();
                        console.log('save success');
                    }

                    word1bai = word1bai - sotuphaihoc
                    dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                }
                tuthuabuasaugrammar = word1bai;

            }

            else if (tuthuabuasaugrammar > 0) {
                var word1bai = tbgrammar;
                var sotuphaihoc = result[i].grammar;

                if (tuthuabuasaugrammar < result[i].grammar) {

                    sotuphaihoc = sotuphaihoc - tuthuabuasaugrammar;
                    const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                    console.log(`${dateeee} hoc bai ${k} (${tuthuabuasaugrammar}) grammar`);

                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) grammar`);
                    const data = [];
                    const a = {};
                    a.type = "grammar";
                    a.level = result[i].level;
                    a.lession = k;
                    a.number = tuthuabuasaugrammar;
                    data.push(a);
                    const b = {};
                    b.type = "grammar";
                    b.level = result[i].level;
                    b.lession = k + 1;
                    b.number = sotuphaihoc;
                    data.push(b);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        schedule.data.push(b);
                        await schedule.save();
                        console.log('save success ', schedule.data);
                    }
                    else {
                        // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        // await schedule.save();
                        console.log('save success');
                    }
                    tuthuabuasaugrammar = tbgrammar - sotuphaihoc;
                    dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                    while (tuthuabuasaugrammar < word1bai && Math.floor(tuthuabuasaugrammar / result[i].grammar) !== 0) {
                        const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                        console.log(`${dateeee} hoc bai ${k + 1} (${result[i].grammar}) grammar`);

                        const data = [];
                        const a = {};
                        a.type = "grammar";
                        a.level = result[i].level;
                        a.lession = k + 1;
                        a.number = result[i].grammar;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            // await schedule.save();
                            console.log('save success');
                        }

                        dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasaugrammar = tuthuabuasaugrammar - result[i].grammar;


                    }
                }
                else {
                    var word1bai = tbgrammar;
                    var sotuphaihoc = result[i].grammar;
                    while (tuthuabuasaugrammar < word1bai && Math.floor(tuthuabuasaugrammar / result[i].grammar) !== 0) {
                        const dateeee = fixDigit(dategrammar.getFullYear()) + '-' + fixDigit(dategrammar.getMonth() + 1) + '-' + fixDigit(dategrammar.getDate());
                        console.log(`${dateeee} hoc bai ${k} (${sotuphaihoc}) tu`);

                        const data = [];
                        const a = {};
                        a.type = "grammar";
                        a.level = result[i].level;
                        a.lession = k;
                        a.number = sotuphaihoc;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            // await schedule.save();
                            console.log('save success');
                        }

                        dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasaugrammar = tuthuabuasaugrammar - sotuphaihoc;


                    }
                    dategrammar = new Date(dategrammar.getTime() + (24 * 60 * 60 * 1000));
                }

            }
        }

        console.log('KANJI NE');
        const kanjilevel = await Kanji.find({ level: result[i].level });
        const maxkanji = Math.max(...kanjilevel.map(w => w.lession ?? 1));
        const tbkanji = (kanjilevel.length / maxkanji).toFixed() * 1;
        var tuthuabuasaukanji = 0;
        for (var k = 0; k < maxkanji; k++) {
            console.log('bai ', k + 1);
            var tbbb = tbkanji;
            while(tuthuabuasaukanji === 0 && tbbb%result[i].kanji === 0 && tbbb !==0) {
                const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                const data = [];
                const a = {};
                a.type = "kanji";
                a.level = result[i].level;
                a.lession = k + 1;
                a.number = result[i].kanji;
                data.push(a);
                console.log(`${dateeee} hoc bai ${k + 1} (${result[i].kanji}) kanji`);
                const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        await schedule.save();
                        console.log('save success', schedule.data);
                    }
                    else {
                        // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        // await schedule.save();
                        console.log('save success');
                    }
                    tbbb = tbbb - result[i].kanji;
                    datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
            }

            // var hoanthanh1bai = ()
            if (tuthuabuasaukanji === 0 &&tbkanji%result[i].kanji !== 0) {
                var word1bai = tbkanji;
                var sotuphaihoc = result[i].kanji;
                console.log(word1bai);
                while (sotuphaihoc < word1bai && Math.floor(sotuphaihoc / result[i].kanji) === 1) {
                    const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) kanji`);

                    const data = [];
                    const a = {};
                    a.type = "kanji";
                    a.level = result[i].level;
                    a.lession = k + 1;
                    a.number = sotuphaihoc;
                    data.push(a);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        await schedule.save();
                        console.log('save success', schedule.data);
                    }
                    else {
                        // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        // await schedule.save();
                        console.log('save success');
                    }

                    word1bai = word1bai - sotuphaihoc
                    datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                }
                tuthuabuasaukanji = word1bai;

            }

            else if (tuthuabuasaukanji > 0) {
                var word1bai = tbkanji;
                var sotuphaihoc = result[i].kanji;

                if (tuthuabuasaukanji < result[i].kanji) {

                    sotuphaihoc = sotuphaihoc - tuthuabuasaukanji;
                    const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                    console.log(`${dateeee} hoc bai ${k} (${tuthuabuasaukanji}) kanji`);

                    console.log(`${dateeee} hoc bai ${k + 1} (${sotuphaihoc}) kanji`);

                    const data = [];
                    const a = {};
                    a.type = "kanji";
                    a.level = result[i].level;
                    a.lession = k;
                    a.number = tuthuabuasaukanji;
                    data.push(a);
                    const b = {};
                    b.type = "kanji";
                    b.level = result[i].level;
                    b.lession = k + 1;
                    b.number = sotuphaihoc;
                    data.push(b);
                    const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                    if (schedule) {
                        schedule.data.push(a);
                        schedule.data.push(b);
                        await schedule.save();
                        console.log('save success ', schedule.data);
                    }
                    else {
                        // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                        // await schedule.save();
                        console.log('save success');
                    }

                    tuthuabuasaukanji = tbkanji - sotuphaihoc;
                    datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                    while (tuthuabuasaukanji < word1bai && Math.floor(tuthuabuasaukanji / result[i].kanji) !== 0) {
                        const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                        console.log(`${dateeee} hoc bai ${k + 1} (${result[i].kanji}) kanji`);

                        const data = [];
                        const a = {};
                        a.type = "kanji";
                        a.level = result[i].level;
                        a.lession = k + 1;
                        a.number = result[i].kanji;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            // await schedule.save();
                            console.log('save success');
                        }

                        datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasaukanji = tuthuabuasaukanji - result[i].kanji;


                    }
                }
                else {
                    var word1bai = tbkanji;
                    var sotuphaihoc = result[i].kanji;
                    while (tuthuabuasaukanji <= word1bai && Math.floor(tuthuabuasaukanji / result[i].kanji) !== 0) {
                        const dateeee = fixDigit(datekanji.getFullYear()) + '-' + fixDigit(datekanji.getMonth() + 1) + '-' + fixDigit(datekanji.getDate());
                        console.log(`${dateeee} hoc bai ${k} (${sotuphaihoc}) kanji`);

                        const data = [];
                        const a = {};
                        a.type = "kanji";
                        a.level = result[i].level;
                        a.lession = k;
                        a.number = sotuphaihoc;
                        data.push(a);
                        const schedule = await Schedule.findOne({ user_id, nameSchedule, date: dateeee });
                        if (schedule) {
                            schedule.data.push(a);
                            await schedule.save();
                            console.log('save success', schedule.data);
                        }
                        else {
                            // const schedule = new Schedule({ user_id, nameSchedule, data, date: dateeee, time: time, timenoti: notiTime, method: 1 });
                            // await schedule.save();
                            console.log('save success');
                        }



                        datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                        tuthuabuasaukanji = tuthuabuasaukanji - sotuphaihoc;


                    }
                    datekanji = new Date(datekanji.getTime() + (24 * 60 * 60 * 1000));
                }

            }
        }

        if (date > dategrammar && date > datekanji) {
            dategrammar = date;
            datekanji = date;
        }
        else if (dategrammar > date && dategrammar > datekanji) {
            date = dategrammar;
            datekanji = dategrammar;
        }
        else if (datekanji > date && datekanji > dategrammar) {
            date = datekanji;
            dategrammar = datekanji;
        }

    }
    return res.json({ code: 1 });
}

const deletesuggestPlain = async (req, res) => {
    const { user_id } = req.body;
    Schedule.deleteMany({ user_id: user_id, nameSchedule: "Học theo kế hoạch của app " }, function (err) {
        if (err) {
            return res.json({ code: 0, err: "Có lỗi xảy ra!!Vui lòng thử lại" });
        }
        else {
            return res.json({ code: 1, mess: "Xoá kế hoạch thành công" });
        }
    })

}
const setUserForSchedule = async (req, res) => {
    const schedule = await Schedule.find();
    for (var i = 0; i < schedule.length; i++) {
        schedule[i].user_id = "61590bbd7463724428b252d2";
        await schedule[i].save();
        console.log('save succss');
    }
}
module.exports = {
    startLearnTest,
    deletesuggestPlain,
    setUserForSchedule,
    testSchedule,
    startLearn,
    suggesst1,
    suggesst,
    remind,
    getSchedule,
    deleteschedule,
    editschedule
};