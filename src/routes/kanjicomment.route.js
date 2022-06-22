const express = require('express')
const router = express.Router()
const KanjiCommentController = require('../controllers/kanjicomment.controller');

router.post('/getKanjiComment', KanjiCommentController.getKanjiComment)
// router.post('/createKanjiComment', KanjiCommentController.createKanjiComment)
router.post('/createLikeKanjiComment', KanjiCommentController.createLikeKanjiComment)
router.post('/createDisLikeKanjiComment', KanjiCommentController.createDisLikeKanjiComment)
router.get('/getAllKanjiComment', KanjiCommentController.getAllKanjiComment)

module.exports = router