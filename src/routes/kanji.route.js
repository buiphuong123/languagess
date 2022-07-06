const express = require('express')
const router = express.Router()
const kanjiController = require('../controllers/kanji.controller');

router.get('/dataKanji', kanjiController.dataKanji)
// router.get('/dataImage', kanjiController.dataImage)
// router.get('/dataExplain', kanjiController.dataExplain)
router.post('/getKanji', kanjiController.getKanji)
router.post('/createMemKanji', kanjiController.createMemKanji)
router.post('/createLikeKanji', kanjiController.createLikeKanji)
router.get('/compDetailKanji', kanjiController.compDetailKanji)
router.get('/countKanji', kanjiController.countKanji)
router.get('/setLessionKanji', kanjiController.setLessionKanji)
router.get('/findType', kanjiController.findType)
router.post('/createKanjiComment', kanjiController.createKanjiComment)

router.get('/testWordReplace', kanjiController.testWordReplace)
router.post('/deleteKanji', kanjiController.deleteKanji)
router.post('/accpetCommentKanji', kanjiController.accpetCommentKanji)
router.post('/refuseCommentKanji', kanjiController.refuseCommentKanji)
router.get('/countLevelKanji', kanjiController.countLevelKanji)

router.post('/createKanjiNew', kanjiController.createKanjiNew)
router.post('/editKanjiNew', kanjiController.editKanjiNew)

module.exports = router