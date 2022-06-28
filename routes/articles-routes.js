const express = require('express');
const JOI = require('joi');
const router = express.Router();
const articleController = require('../controllers/articles-controller');

router.post('/create', articleController.create);

router.patch('/update/:id', articleController.update);

router.delete("/delete/:id", articleController.deleteArticle);

router.post("/store/:idArticle/in/:idJournal", articleController.storeArticleInJournal);

router.get("/articlesByAuthor/:id", articleController.getArticlesByAuthor);

router.patch("/accept/:accept/:idArticle", articleController.acceptArticle);

module.exports = router;