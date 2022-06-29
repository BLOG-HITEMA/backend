const express = require('express');
const JOI = require('joi');
const router = express.Router();
const articleController = require('../controllers/articles-controller');
const checkAuth = require('../middleware/check-auth');

router.get("/articlesByAuthor/:id", articleController.getArticlesByAuthor);

router.use(checkAuth);

router.post('/create', articleController.create);

router.patch('/update/:id', articleController.update);

router.delete("/delete/:id", articleController.deleteArticle);

router.get("/store/:idArticle/in/:idJournal", articleController.storeArticleInJournal);

router.patch("/accept/:accept/:idArticle", articleController.acceptArticle);

router.get("/all", articleController.getAll);

module.exports = router;