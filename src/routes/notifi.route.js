const express = require('express')
const router = express.Router()
const notifiController = require('../controllers/notifi.controller.js');
router.post('/sendNotiToDevice', notifiController.sendNotiToDevice)
router.post('/createNotifi', notifiController.createNotifi)
router.post('/getNotifi', notifiController.getNotifi)
router.post('/takeData', notifiController.takeData)
router.post('/editReadNotifi', notifiController.editReadNotifi)
router.post('/sendNotiToDeviceAsset', notifiController.sendNotiToDeviceAsset)
router.get('/testsend', notifiController.testsend)

router.get('/test1', notifiController.test1)

module.exports = router