const express = require('express');
const JOI = require('joi');
const router = express.Router();
const articleController = require('../controllers/articles-controller');

router.get('/create', articleController.create);

module.exports = router;