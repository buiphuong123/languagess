const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller.js');
router.post('/signUp', authController.signUp)
router.get('/confirmation/:email/:token', authController.confirmation)
router.post('/resendLink', authController.resendLink)
router.post('/forgot', authController.forgot)
router.put('/resetPassword/:token', authController.resetPassword)
router.post('/login', authController.login)
router.post('/logout', authController.logout)
router.get('/sendMail', authController.sendMail)
router.post('/changePassword', authController.changePassword)
router.get('/getListUser', authController.getListUser)
router.post('/editUser', authController.editUser)
router.post('/uploadAvatar', authController.uploadAvatar)
router.post('/ChangPasswordUser', authController.ChangPasswordUser)

module.exports = router