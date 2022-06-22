const express = require('express')
const router = express.Router()
const commentController = require('../controllers/comment.controller');

router.post('/createComment', commentController.createComment)
router.post('/createLikeComment', commentController.createLikeComment)
router.post('/createDisLikeComment', commentController.createDisLikeComment)
router.get('/userRequest', commentController.userRequest)
router.post('/browseComment', commentController.browseComment)
router.post('/getComment', commentController.getComment)
router.post('/countLike', commentController.countLike)
router.post('/countDisLike', commentController.countDisLike)
router.get('/test', commentController.test)
router.get('/testComment', commentController.testComment)
router.get('/getAllGrammarComment', commentController.getAllGrammarComment)

module.exports = router