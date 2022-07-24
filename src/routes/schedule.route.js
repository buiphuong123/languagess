const express = require('express')
const router = express.Router()
const scheduleController = require('../controllers/schedule.controller');

router.post('/remind', scheduleController.remind)
router.post('/getSchedule', scheduleController.getSchedule)
router.post('/deleteschedule', scheduleController.deleteschedule)
router.post('/editschedule', scheduleController.editschedule)


router.post('/suggesst', scheduleController.suggesst)
router.post('/suggesst1', scheduleController.suggesst1)
router.post('/startLearn', scheduleController.startLearn)
router.post('/testSchedule', scheduleController.testSchedule)

router.get('/setUserForSchedule', scheduleController.setUserForSchedule)
router.post('/deletesuggestPlain', scheduleController.deletesuggestPlain)
router.post('/startLearnTest', scheduleController.startLearnTest)
router.post('/runNotifi', scheduleController.runNotifi)

module.exports = router