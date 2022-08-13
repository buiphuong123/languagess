const express = require('express');
const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwtHelper = require('../helper/jwt.helper');
const nodemailer = require("nodemailer");
var async = require('async');
var crypto = require('crypto');

const login = async (req, res) => {
    const { username, password, notifiToken } = req.body;
    console.log('BEN MAY THAT DAY NHE', username, password, notifiToken);
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
                            success: 'Đăng nhập thành công'
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
                    return res.json({ error: 'Mật khẩu hoặc tài khoản không đúng', code: 0 });
                }
            }
            else {
                return res.json({ error: 'Chưa xác nhận email! Vui lòng xác nhận email để đăng nhập', code: 0 });
            }

        }
        else {
            return res.json({ error: 'Không tìm thấy tài khoản', code: 0 });
        }
    } catch (error) {
        return res.json({ error });
    }
}

const sendMail = async (req, res) => {
    var transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: 'phuongbui7399@gmail.com', pass: 'ybuhcrkcgbmaekjr' } });
    var mailOptions = { from: 'phuongbui7399@gmail.com', to: 'buithiphuong07031999@gmail.com', subject: 'kakakaka' };
    transporter.sendMail(mailOptions, function (err) {
        if (err) {
            console.log('SEND MAIL ERROR', err);
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
                return res.json({ code: 1, success: 'Một email xác thực đã được gửi tới ' + newUser.email + '. Bạn hãy vào xác nhận email' });
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
                return res.status(500).send({ msg: 'Sự cố kỹ thuật !, Vui lòng nhấp vào gửi lại để xác minh Email của bạn.' });
            }
            return res.status(200).send('Một email xác thực đã được gửi tới ' + user.email + '. Nếu bạn không nhận được email xác minh, hãy nhấp vào gửi lại mã thông báo.');
        });

    }
}

const forgot = async (req, res) => {
    console.log('VAO BEN API CHUA');
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
                    return res.json({ code: 0,error: 'Không có tài khoản với địa chỉ email đó tồn tại.' });
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
                return res.json({ code: 1, success: 'Một email đã được gửi tới ' + user.email + ' với hướng dẫn thêm' })
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
        return res.json({code: 0, error: 'Tài khoản không tồn tại' });
    }
    else {
        console.log(req.body.token);
        const resetToken = await User.findOne({ resetPasswordToken: req.body.token });
        if (!resetToken) {
            return res.json({code: 0, error: 'reset token error' });
        }
        else {
            const time = await User.findOne({ resetPasswordExpires: { $gt: Date.now() } });
            if (!time) {
                return res.json({ code: 0, error: 'Mã thông báo đặt lại mật khẩu đã hết hạn' });
            }
            else {
                return res.json({ code: 1, success: 'Đặt mã thông báo thành công' });
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
            return res.json({ code: 0, error: 'Thay đổi mật khẩu lỗi' });
        }
        else {
            return res.json({ code: 1, success: 'Thay đổi mật khẩu thành công' });
        }
    })

}
// const logout = async (req, res) => {
//     const { token, notifiToken } = req.body;
//     console.log('vao logout');
//     console.log('token', token, notifiToken);
//     try {
//         const decode = await jwtHelper.verifyToken(token);
//         const user = await User.findById({
//             _id: decode.data._id,
//             token: decode.data.token,
//         });
//         if (user) {
//             await User.findByIdAndUpdate(decode.data._id, {
//                 $set: {
//                     token: null,
//                     notifiToken: null
//                     // notifiToken: user.notifiToken.filter(item => item !== notifiToken)
//                 },
//             });
//             return res.json({ code: 1, message: 'logout success' });
//         }
//     } catch (error) {
//         return res.json({ code: 0, message: 'not found acount' });
//     }
// }

const logout = async(req, res) => {
    const {id} = req.body;
    console.log('vao logout');
    const user = await User.findOne({_id: id});
    if(user) {
        user.token = "";
        user.notifiToken = "";
        user.save(function(err) {
            if(err) {
                return res.json({code: 0, mess: "ĐĂng xuất lỗi"});
            }
            else {
                return res.json({code: 1, mess: "Đăng xuất thành công"});
            }
        })
    }
    else {
        return res.json({code: 0, mess: "Đăng xuất lỗi"});
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
const editUser = async(req, res) => {
    const {id, username, level, hobby} = req.body;
    const user = await User.findOne({_id: id});
    if(user) {
        user.username = username;
        user.level = level; 
        user.hobby = hobby;
        await user.save() ;
        return res.json({code: 1, mess: 'save success'});
    }
}

const uploadAvatar = async(req, res) => {
    const {id, avatar} = req.body;
    const user = await User.findOne({_id: id});
    if(user) {
        user.avatar = avatar;
    await user.save() ;
    return res.json({code: 1, mess: 'success'});
    }
}
const ChangPasswordUser = async(req, res) => {
    const {id, pass, newPass} = req.body;
    console.log(pass, newPass);
    const user = await User.findOne({_id: id});
    if(user) {
        if(await bcrypt.compare(pass, user.password)){
            const hashedPassword = await bcrypt.hash(newPass, 12);
            user.password = hashedPassword;
            await user.save(function(error) {
                if(error) {
                    return res.json({code: 0, mess: 'Có một số lỗi xảy ra!!!'});
                }
                else {
                    return res.json({code: 1, mess: 'Thay đổi mật khẩu thành công', user: user });
                }
            })
        }
        else {
            return res.json({code: 0, mess: 'Bạn nhập sai mật khẩu'});
        }
    }
}
module.exports = {
    ChangPasswordUser,
    uploadAvatar,
    editUser,
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