const { Article, joiSchema } = require('../models/article');

const create = async (req, res) => {
    const payload = req.body;
    const { error } = joiSchema.validate(payload);
    if (error) return res.status(400).send(error.details[0].message);

    const article = new Article({
        title: payload.title,
        content: payload.content,
        published: payload.published,
        image: payload.image,
        message: payload.message
    });

    await article.save();
    res.status(201).send(article);
}

const update = async (req, res) => {
    
}

const deleteArticle = (req, res) => {

}

const storeArticleInJournal = (req, res) => {

}

const getArticlesByAutor = (req, res) => {

}

const acceptArticle = (req, res) => {

}

module.exports = { create, update, deleteArticle, storeArticleInJournal, getArticlesByAutor, acceptArticle };