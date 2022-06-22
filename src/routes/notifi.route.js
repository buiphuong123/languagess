const express = require('express')
const router = express.Router()
const notifiController = require('../controllers/notifi.controller.js');
router.post('/sendNotiToDevice', notifiController.sendNotiToDevice)
router.post('/createNotifi', notifiController.createNotifi)
router.post('/test1', notifiController.test1)
router.post('/getNotifi', notifiController.getNotifi)
router.post('/takeData', notifiController.takeData)
router.post('/editReadNotifi', notifiController.editReadNotifi)
router.post('/sendNotiToDeviceAsset', notifiController.sendNotiToDeviceAsset)

module.exports = router