const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller');
router.post('/addAdmin', adminController.addAdmin)
router.post('/addSupManager', adminController.addSupManager)
router.post('/deleteSupManager', adminController.deleteSupManager)
router.post('/deleteAdmin', adminController.deleteAdmin)
router.post('/deleteUser', adminController.deleteUser)

module.exports = router