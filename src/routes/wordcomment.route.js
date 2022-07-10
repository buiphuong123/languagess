const express = require('express')
const router = express.Router()
const wordcommentController = require('../controllers/wordcomment.controller');

// router.post('/createWordComment', wordcommentController.createWordComment)
router.post('/createLikeWordComment', wordcommentController.createLikeWordComment)
router.post('/createDisLikeWordComment', wordcommentController.createDisLikeWordComment)
// router.get('/userRequest', wordcommentController.userRequest)
// router.post('/browseComment', wordcommentController.browseComment)
router.post('/getCommentWord', wordcommentController.getCommentWord)
router.post('/countWordLike', wordcommentController.countWordLike)
router.post('/countWordDisLike', wordcommentController.countWordDisLike)
// router.get('/test', wordcommentController.test)
router.get('/testWordComment', wordcommentController.testWordComment)
router.get('/getAllWordComment', wordcommentController.getAllWordComment)
router.post('/getCommentTest', wordcommentController.getCommentTest)

module.exports = router