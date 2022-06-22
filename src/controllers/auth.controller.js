const express = require('express');
const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwtHelper = require('../helper/jwt.helper');
const nodemailer = require("nodemailer");
var async = require('async');
var crypto = require('crypto');

const login = async (req, res) => {
    const { username, password, notifiToken } = req.body;
    console.log('BEN MAY THAT DAY NHE', username, password);
    console.log('vao login');
    try {
        const user = await User.findOne({ username });
        if (user) {
            if (user.isVerified) {
                if (await bcrypt.compare(password, user.password)) {
                    const accessToken = await jwtHelper.generateToken({
                        _id: user._id,
                        username: user.username,
                    });
                    await User.findOneAndUpdate(
                        { _id: user._id },
                        {
                            $set: {
                                token: accessToken,
                            },
                        }
                    );
                    user.notifiToken = notifiToken;
                    await user.save(function (err) {
                        if(err) {
                            return res.json({ err });
                        }
                        return res.json({
                            code: 1,
                            user: user,
                            success: 'login success'
                        });
                    })
                    // await newUser.save(function (err) {
                    //     if (err) {
                    //         return res.json({ err });
                    //     }
                    // console.log(user);
                    // return res.json({
                    //     code: 1,
                    //     user: user,
                    //     success: 'login success'
                    // })

                }
                else {
                    return res.json({ error: 'password fail', code: 0 });
                }
            }
            else {
                return res.json({ error: 'chua xac nhan email!Vui long xac nhan mail de login', code: 0 });
            }

        }
        else {
            return res.json({ error: 'not found account', code: 0 });
        }
    } catch (error) {
        return res.json({ error });
    }
}

const sendMail = async (req, res) => {
    var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'phuongbui7399@gmail.com', pass: 'susudangyeu12' } });
    var mailOptions = { from: 'phuongbui7399@gmail.com', to: 'buithiphuong07031999@gmail.com', subject: 'kakakaka' };
    transporter.sendMail(mailOptions, function (err) {
        if (err) {
            console.log('SEND MAIL ERROR');
            return res.json({ err });
        }
        console.log('SEND MAIL SUCCESS');
        // return res.json({code: 1, success: 'A verification email has been sent to ' + newUser.email + '. It will be expire after one day. If you not get verification Email click on resend token.'});
    });
}
  

const signUp = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user) return res.json({ code: 0, error: 'accout exist' });
        const usermail = await User.findOne({ email });
        if (usermail) return res.json({ code: 0, error: 'Email da su dung' });
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({ username, email, password: hashedPassword });
        const accessToken = await jwtHelper.generateToken({
            _id: newUser._id,
            username: newUser.username,
        });
        newUser.token = accessToken;
        await newUser.save(function (err) {
            if (err) {
                return res.json({ err });
            }
            var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env['MAIL_ADDRESS'], pass: process.env['MAIL_PASSWORD'] } });
            var mailOptions = { from: process.env['MAIL_ADDRESS'], to: newUser.email, subject: 'Account Verification Link', text: 'Hello ' + newUser.username + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/language' + '\/confirmation\/' + newUser.email + '\/' + newUser.token + '\n\nThank You!\n' };
            transporter.sendMail(mailOptions, function (err) {
                if (err) {
                    console.log('SEND MAIL ERROR');
                    return res.json({ err });
                }
                console.log('SEND MAIL SUCCESS');
                return res.json({ code: 1, success: 'A verification email has been sent to ' + newUser.email + '. It will be expire after one day. If you not get verification Email click on resend token.' });
            });

        });
    } catch (error) {
        return res.json({ code: 0, error });
    }
}

const confirmation = async (req, res) => {
    const token = await User.findOne({ token: req.params.token });
    console.log(token);
    // token is not found into database i.e. token may have expired 
    if (!token) {
        return res.status(400).send({ msg: 'Your verification link may have expired. Please click on resend for verify your Email.' });
    }
    // if token is found then check valid user 
    else {
        User.findOne({ email: req.params.email }, function (err, user) {
            // not valid user
            if (!user) {
                return res.status(401).send({ msg: 'We were unable to find a user for this verification. Please SignUp!' });
            }
            // user is already verified
            else if (user.isVerified) {
                return res.status(200).send('User has been already verified. Please Login');
            }
            // verify user
            else {
                // change isVerified to true
                user.isVerified = true;
                user.save(function (err) {
                    // error occur
                    if (err) {
                        return res.status(500).send({ msg: err.message });
                    }
                    // account successfully verified
                    else {
                        return res.status(200).send('Your account has been successfully verified');
                    }
                });
            }
        });
    }
}

const resendLink = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    // token is not found into database i.e. token may have expired 
    if (!user) {
        return res.status(400).send({ msg: 'We were unable to find a user with that email. Make sure your Email is correct!' });
    }
    // user has been already verified
    else if (user.isVerified) {
        return res.status(200).send('This account has been already verified. Please log in.');

    }
    // send verification link
    else {
        var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: process.env['MAIL_ADDRESS'], pass: process.env['MAIL_PASSWORD'] } });
        var mailOptions = { from: process.env['MAIL_ADDRESS'], to: user.email, subject: 'Account Verification Link', text: 'Hello ' + user.name + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/language' + '\/confirmation\/' + user.email + '\/' + user.token + '\n\nThank You!\n' };
        transporter.sendMail(mailOptions, function (err) {
            if (err) {
                return res.status(500).send({ msg: 'Technical Issue!, Please click on resend for verify your Email.' });
            }
            return res.status(200).send('A verification email has been sent to ' + user.email + '. It will be expire after one day. If you not get verification Email click on resend token.');
        });

    }
}

const forgot = async (req, res) => {
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = Math.floor(Math.random() * 9999) + 1000;
                done(err, token);
            });
        },
        function (token, done) {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (!user) {
                    //   console.log('error', 'No account with that email address exists.');
                    return res.json({ error: 'No account with that email address exists.' });
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function (err) {
                    done(err, token, user);
                });
            });
        },
        function (token, user, done) {
            var smtpTrans = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env['MAIL_ADDRESS'],
                    pass: process.env['MAIL_PASSWORD']
                }
            });
            var mailOptions = {
                from: process.env['MAIL_ADDRESS'],
                to: user.email,
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please check secret code the following to recover password\n\n' +
                    + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'

            };
            smtpTrans.sendMail(mailOptions, function (err) {
                if (err) {
                    return res.status(500).send({ msg: 'Technical Issue!, Please click on resend for verify your Email.' });
                }
                return res.json({ code: 1, success: 'An e-mail has been sent to ' + user.email + ' with further instructions.' })
            });
        }
    ], function (err) {
        console.log('this err' + ' ' + err);
        return res.json({ error: err });
    });

}

const resetPassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        console.log(user);
        return res.json({ error: 'account not exsist' });
    }
    else {
        console.log(req.params.token);
        const resetToken = await User.findOne({ resetPasswordToken: req.params.token });
        if (!resetToken) {
            return res.json({ err: 'reset token error' });
        }
        else {
            const time = await User.findOne({ resetPasswordExpires: { $gt: Date.now() } });
            if (!time) {
                return res.json({ code: 0, error: 'Password reset token has expired' });
            }
            else {
                return res.json({ code: 1, success: 'reset token success' });
                // user.password = await bcrypt.hash(req.body.password, 12);
                // user.resetPasswordExpires = undefined;
                // user.resetPasswordToken = undefined;
                // user.save(function(error, user) {
                //     if(error) {
                //         return res.json({error: 'change password failed'});
                //     }
                //     else {
                //         return res.json({success: 'change success', user});
                //     }
                // })
            }
        }
    }
}

const changePassword = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetPasswordExpires = undefined;
    user.resetPasswordToken = undefined;
    user.save(function (error, user) {
        if (error) {
            return res.json({ code: 0, error: 'change password failed' });
        }
        else {
            return res.json({ code: 1, success: 'change success' });
        }
    })

}
const logout = async (req, res) => {
    const { token, notifiToken } = req.body;
    console.log('vao logout');
    console.log('token', token, notifiToken);
    try {
        const decode = await jwtHelper.verifyToken(token);
        const user = await User.findById({
            _id: decode.data._id,
            token: decode.data.token,
        });
        if (user) {
            await User.findByIdAndUpdate(decode.data._id, {
                $set: {
                    token: null,
                    notifiToken: null
                    // notifiToken: user.notifiToken.filter(item => item !== notifiToken)
                },
            });
            return res.json({ code: 1, message: 'logout success' });
        }
    } catch (error) {
        return res.json({ code: 0, message: 'not found acount' });
    }
}



// const sendMail = async(req, res) => {
//     const {name, phone, email} = req.body;
//     nodemailer.createTestAccount((err, account) => {
//         const htmlEmail = `
//             <h3>Contact deatails </h3>
//             <ul>
//                 <li>Name: ${name} </li>
//                 <li>Phone: ${phone} </li>
//                 <li>Email: ${email} </li>
//             </ul>
//             <h3> Message <h3>
//         `
//         let mailerConfig = {    
//             host: "smtp.gmail.com",  
//             secure: false,
//             // secureConnection: false, // TLS requires secureConnection to be false
//             // tls: {
//             //     ciphers:'SSLv3'
//             // },
//             // requireTLS:true,
//             port: 587,
//             // debug: true,
//             auth: {
//                 user: "buiphuongtan123@gmail.com",
//                 pass: "susudangyeu12"
//             }
//         };
//         let transporter = nodemailer.createTransport(mailerConfig);

//         let mailOptions = {
//             from: 'buiphuongtan123@gmail.com',
//             to: 'buithiphuong07031999@gmail.com',
//             // replyTo: 'buiphuongtan123@gmail.com',
//             subject: 'Some Subject',
//             text: 'mail from nodejs',
//             html: htmlEmail
//         };

//         transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 res.status(500).send({error})
//             } else {
//                 console.log('Message sent: %s', info.content);
//                 console.log('Message URL: %s', nodemailer.getTestMessageUrl);
//                 res.status(200).json({status: 'OK', msg: 'Email sent'});
//             }
//         });
//     })

// }

const getListUser = async(req, res) => {
    const user = await User.find();
    return res.json({user: user});
}
module.exports = {
    login,
    signUp,
    resendLink,
    confirmation,
    resetPassword,
    forgot,
    logout,
    sendMail,
    changePassword,
    getListUser,
};