const express = require('express');
const User = require('../models/user.model.js');
const nodemailer = require("nodemailer");
var cron = require('node-cron');
const Notification = require('../models/notification.model');
const axios = require('axios');
const Schedule = require('../models/schedule/schedule.model');
var ObjectId = require('mongodb').ObjectID;

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
    const { nameSchedule, note, datestart, dateend, time, timenoti, method, user } = req.body;
    console.log(nameSchedule, note, datestart, dateend, time, timenoti, method, user);
    const user_id = user._id;
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
    var newschedule;
    for (var i = 0; i < dates.length; i++) {
        const dateee = dates[i].getFullYear() + '-' + fixDigit(dates[i].getMonth() + 1) + '-' + fixDigit(dates[i].getDate());
        console.log(dateee);
        newschedule = new Schedule({ user_id, nameSchedule, note, date: dateee, time: time, timenoti: notiTime, method: method, typetime: timenoti });
        await newschedule.save();
        console.log('create success');
        // console.log(fixDigit(dates[i].getFullYear() + '-' + fixDigit(dates[i].getMonth() + 1) + '-' + dates[i].getDate());
    }
    if (check >= from && check <= to) {
        cron.schedule(`0 ${minutes} ${hours} * * *`, async () => {
            console.log('running', hours, minutes);
            if (method === 1) {
                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env['MAIL_ADDRESS'], pass: process.env['MAIL_PASSWORD'] } });
                var mailOptions = { from: process.env['MAIL_ADDRESS'], to: user.email, subject: 'study reminder email', text: 'Hello ' + user.username + 'Now it\'s time to learn Japanese' + '\n\nThank You!\n' };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) {
                        console.log('SEND MAIL ERROR');
                        console.log(err);
                        return res.json({ err });
                    }
                    console.log('SEND MAIL SUCCESS');
                    return res.json({ code: 1, success: 'send mail success' });
                });
            }
            else if (method === 2) {
                var time = new Date();
                console.log('vao send notifi');
                const content = 'study reminder email';
                var time = new Date();
                const action = 'remind';
                const comment_id = "565656";
                const newNotifi = new Notification({ username: user.username, content, time, action, comment_id, data: user });
                await newNotifi.save(function (err) {
                    if (err) {
                        return res.json({ code: 0, error: err });
                    }
                    else {
                        axios.post('https://fcm.googleapis.com/fcm/send', {
                            // "to": 'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ',
                            "to": user.notifiToken,
                            "notification": {
                                "body": `${user.username} ${action} ${content}`,
                                "title": "language"
                            },
                            "data": {
                                "action": action,
                                "routedata": user,
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
                                console.log(err);
                            }
                            )
                    }
                })

            }
            else {
                var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env['MAIL_ADDRESS'], pass: process.env['MAIL_PASSWORD'] } });
                var mailOptions = { from: process.env['MAIL_ADDRESS'], to: user.email, subject: 'study reminder email', text: 'Hello ' + user.username + 'Now it\'s time to learn Japanese' + '\n\nThank You!\n' };
                transporter.sendMail(mailOptions, function (err) {
                    if (err) {
                        console.log('SEND MAIL ERROR');
                        console.log(err);
                        return res.json({ err });
                    }
                    console.log('SEND MAIL SUCCESS');
                    // return res.json({ code: 1, success: 'send mail success' });
                });

                var time = new Date();
                console.log('vao send notifi');
                const content = 'study reminder email';
                var time = new Date();
                const action = 'remind';
                const comment_id = "565656";
                const newNotifi = new Notification({ username: user.username, content, time, action, comment_id, data: user, typetime: timenoti });
                await newNotifi.save(function (err) {
                    if (err) {
                        return res.json({ code: 0, error: err });
                    }
                    else {
                        axios.post('https://fcm.googleapis.com/fcm/send', {
                            // "to": 'cVVGGz4rRCC7_hdLwmHh9K:APA91bG7ceBsLeF7rcziCVbQ0wyGQ0YHXrpVN6VxQVCrQTcxOANdHXsRe-vGguZcrD1c7ubM9wJsX93UhNgKMl5i7lWdVIT8kqcLeA7n28QTQjy2SIqhGdZwzQ4NZn9kKk5pzkNEhhnQ',
                            "to": user.notifiToken,
                            "notification": {
                                "body": `${user.username} ${action} ${content}`,
                                "title": "language"
                            },
                            "data": {
                                "action": action,
                                "routedata": user,
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

const editschedule = async(req, res) => {
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
            schedule.typetime= timenoti;
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
        schedule.typetime= timenoti;
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

module.exports = {
    remind,
    getSchedule,
    deleteschedule,
    editschedule
};