const express = require('express');
const JOI = require('joi');
const router = express.Router();
const articleController = require('../controllers/articles-controller');
const checkAuth = require('../middleware/check-auth');

router.get("/author/:id", articleController.getArticlesByAuthor);

router.get("/", articleController.getAll);

router.get("/search/:page/:search", articleController.search);

router.get("/:id", articleController.getArticleById);


router.use(checkAuth);


router.post('/', articleController.create);

router.patch('/:id', articleController.update);

router.delete("/:id", articleController.deleteArticle);

router.post("/store/:idArticle/in/:idJournal", articleController.storeArticleInJournal);

router.patch("/accept/:accept/:idArticle", articleController.acceptArticle);


module.exports = router;