const express = require("express");
const { check } = require('express-validator');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const journalsControllers = require('../controllers/journals-controllers')
const articlesControllers = require('../controllers/articles-controller');

router.get('/', journalsControllers.getJournals)
router.get('/:id', journalsControllers.getJournalById)
router.get('/:id/articles', articlesControllers.getArticlesOfJournal)
router.get("/editor/:id", journalsControllers.getJournalByEditor);

router.use(checkAuth);

router.get('/articles/enAttente', journalsControllers.getArticlesNonPublished);

router.post('/', [
    check('title').not().isEmpty()
], journalsControllers.createJournal)

router.patch('/:id', journalsControllers.updateJournal)

router.delete('/:id', journalsControllers.deleteJournal)

module.exports = router;