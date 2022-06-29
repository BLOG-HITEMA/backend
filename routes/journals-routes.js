const express = require("express");
const { check } = require('express-validator');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const journalsControllers = require('../controllers/journals-controllers')

router.get('/', journalsControllers.getJournals)

router.use(checkAuth);

router.post('/', [
    check('title').not().isEmpty()
], journalsControllers.createJournal)

router.patch('/:id', journalsControllers.updateJournal)

router.delete('/:id', journalsControllers.updateJournal)

module.exports = router;