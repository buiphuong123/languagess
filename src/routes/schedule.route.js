const express = require('express')
const router = express.Router()
const scheduleController = require('../controllers/schedule.controller');

router.post('/remind', scheduleController.remind)
router.post('/getSchedule', scheduleController.getSchedule)
router.post('/deleteschedule', scheduleController.deleteschedule)
router.post('/editschedule', scheduleController.editschedule)

module.exports = router