const express = require('express')
const router = express.Router()
const vocabularyController = require('../controllers/vocabulary.controller');

router.post('/getVocabulary', vocabularyController.getVocabulary)
router.post('/createVocabulary', vocabularyController.createVocabulary)
router.post('/editVocabulary', vocabularyController.editVocabulary)
router.post('/deleteVocabulary', vocabularyController.deleteVocabulary)
router.post('/createWordInVoca', vocabularyController.createWordInVoca)
router.post('/editWordInVoca', vocabularyController.editWordInVoca)
router.post('/deleteWordInVoca', vocabularyController.deleteWordInVoca)
router.post('/create', vocabularyController.create)
router.post('/shareVocabulary', vocabularyController.shareVocabulary)
router.post('/getVocabularyShare', vocabularyController.getVocabularyShare)

module.exports = router