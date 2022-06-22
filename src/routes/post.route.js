const express = require('express');
const router = express.Router()
const postController = require('../controllers/postController');

router.post('/getPost', postController.getPost)
router.post('/createPost', postController.createPost)
router.post('/createlikePost', postController.createlikePost)
router.post('/createCommentPost', postController.createCommentPost)
router.post('/editPost', postController.editPost)
router.post('/deletePost', postController.deletePost)
router.post('/acceptPost', postController.acceptPost)
router.post('/refusePost', postController.refusePost)
router.get('/setReviewPost', postController.setReviewPost)
router.get('/testPost', postController.testPost)

module.exports = router