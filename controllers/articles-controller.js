const { Article, joiSchema } = require('../models/article');
const User = require('../models/user');
const Journal = require('../models/journal');
const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

require("dotenv").config();
const max_articles_number = process.env.MAX_ARTICLES_PER_PAGE || 10;

const create = async (req, res, next) => {
    const payload = req.body;

    checkIfEditor(req.userData.id, next);

    const { error } = joiSchema.validate(payload);
    if (error) return res.status(400).send({message : error.details[0].message});

    const article = new Article({
        title: payload.title,
        content: payload.content,
        published: payload.published,
        image: payload.image,
        message: payload.message,
        user: user._id
    });

    await article.save();

    return res.status(201).send(article);

}

const update = async (req, res, next) => {
    checkIfEditor(req.userData.id, next);
    
    const payload = req.body;
    const { error } = joiSchema.validate(payload);
    if (error) return res.status(400).send({message : error.details[0].message});

    const article = await Article.findByIdAndUpdate(req.params.id, payload);
    if (!article) return res.status(404).send({message : "L'article n'existe pas."});

    res.status(200).send({ ...article._doc, ...payload});
}

const deleteArticle = async (req, res, next) => {
    checkIfEditor(req.userData.id, next);

    const article = await Article.findByIdAndDelete(req.params.id).exec()
    .then( (data) => {
        if (!data) return res.status(404).send({message : "L'article n'existe pas."});
        res.status(200).send("Article supprimé.");
    });
}

const storeArticleInJournal = async (req, res, next) => {
    checkIfEditor(req.userData.id, next);

    const { idJournal, idArticle } = req.params;

    const journal = await Journal.findById(idJournal);
    const article = await Article.findByIdAndUpdate(idArticle, {journal: idJournal});

    if (!journal) return res.status(404).send({message : "Le journal n'existe pas."});

    if (!article) return res.status(404).send({message : "L'article n'existe pas."});

    journal.articles.push(article);

    await journal.save();

    res.status(200).send("L'article a été ajouter au journal.");
}

const getArticlesByAuthor = async (req, res, next) => {
    const author = req.params.id;

    const user = await User.findById(author);

    if (!user) return res.status(404).send({message : "L'utilisateur n'existe pas."});

    const articles = await Article.find({user: author});

    if (!articles) return res.status(404).send({message : "Aucun article n'a été trouvé."});
    
    res.status(200).send(articles);
}

const getAll = async (req, res, next) => {
    // const page = parseInt(req.params.page) || 1;

    let articles = await Article.find();

    // const max_pages = articles.length / max_articles_number;

    // articles = articles.splice((page - 1) * max_articles_number, max_articles_number * page);

    // res.status(200).send({articles, page, max_pages});

    res.status(200).send(articles);
}

const search = async (req, res, next) => {
    const page = parseInt(req.params.page) || 1;

    const {search} = req.body;

    let articles = (await Article.find());

    articles = articles
    .filter(e => e.title === search || e.content === search)
    .splice((page - 1) * max_articles_number, max_articles_number * page);
    
    const max_pages = articles.length / max_articles_number;

    res.status(200).send({articles, page, max_pages});
}

const getArticleById = async (req, res, next) => {
    const id = req.params.id;

    const article = await Article.findById(id);

    if (!article) return res.status(404).send({message : "L'article n'existe pas."});

    res.status(200).send(article);
}

const acceptArticle = (req, res, next) => {
    const { message } = req.body;
    const accept = req.params.accept;
    const id = req.params.idArticle;

    if (accept != 0) {
        Article.findByIdAndUpdate(id, {published: true, message: message}).exec()
        .then( (data) => {
            if (!data) return res.status(404).send({message : "L'article n'existe pas."});
            res.status(200).send("Article publié.");
        }).catch( (err) => {
            res.status(500).send({message : "Erreur lors de la publication de l'article."});
        } );
    }
    else {
        Article.findByIdAndUpdate(id, {published: false, message: message, journal: null}).exec()
        .then( (data) => {
            if (!data) return res.status(404).send({message : "L'article n'existe pas."});
            res.status(200).send("Article refusé.");
        }).catch( (err) => {
            res.status(500).send({message : "Erreur lors de la publication de l'article."});
        } );
    }
}

const getArticlesOfJournal = async (req, res, next) => {
    const journalID = req.params.idJournal;

    const journal = await Journal.findById(journalID);

    if (!journal) return res.status(404).send({message : "Le journal n'existe pas."});

    const articles = await Article.find({journal : journalID});

    if (!articles) return res.status(404).send({message : "Aucun article n'a été trouvé."});
    
    res.status(200).send(articles);
}

const checkIfEditor = async (id, next) => {
    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        const error = new HttpError(
            'La création de l\'article a échouée, réessayez utérieurement',
            500
        );
        return next(error);
    }
    if(!user){
        const error = new HttpError(
            "L'utilisateur est introuvable.",
            404
        );
        return next(error);
    }
    if(user.role=="editor"){
        const error = new HttpError(
            "Vous n'êtes pas autorisé pour créer un article",
            403
        );
        return next(error);
    }
}

module.exports = { 
    create, 
    update, 
    deleteArticle, 
    storeArticleInJournal, 
    getArticlesByAuthor, 
    acceptArticle, 
    getAll, 
    getArticleById,
    search,
    getArticlesOfJournal
};
