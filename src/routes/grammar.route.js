const express = require('express')
const router = express.Router()
const grammarController = require('../controllers/grammar.controller');

router.get('/subKanji', grammarController.subKanji)
router.post('/createGrammar', grammarController.createGrammar)
router.post('/getGrammar', grammarController.getGrammar)
router.post('/createExample', grammarController.createExample)
router.post('/GrammarofId', grammarController.GrammarofId)
router.post('/createMemGrammar', grammarController.createMemGrammar)
router.post('/getNameGrammar', grammarController.getNameGrammar)
router.get('/furihira', grammarController.furihira)
router.get('/dataGrammar', grammarController.dataGrammar)
router.get('/furiGrammar', grammarController.furiGrammar)
router.get('/countGr', grammarController.countGr)
router.get('/createLessionGrammar', grammarController.createLessionGrammar)

router.post('/createGrammarNew', grammarController.createGrammarNew)
router.post('/deleteGrammar', grammarController.deleteGrammar)
router.post('/editGrammarNew', grammarController.editGrammarNew)
router.get('/getNumberkk', grammarController.getNumberkk)

module.exports = router