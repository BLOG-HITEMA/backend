const { Article, joiSchema } = require('../models/article');

const create = async (req, res) => {
    const payload = req.body;
    const { error } = joiSchema.validate(payload);
    if (error) return res.sendStatus(400).send(error.details[0].message);

    const article = new Article({
        title: payload.title,
        content: payload.content,
        published: payload.published,
        image: payload.image,
        message: payload.message
    });

    await article.save();
    res.sendStatus(201).send(article);
    res.sendStatus(400).send({erreur : error.message});
}

const update = async (req, res) => {
    const payload = req.body;
    const { error } = joiSchema.validate(payload);
    if (error) return res.sendStatus(400).send(error.details[0].message);

    const article = await Article.findByIdAndUpdate(req.params.id, payload);
    if (!article) return res.sendStatus(404).send("L'article n'existe pas.");

    res.sendStatus(200).send({ _id : article._id, ...payload});
}

const deleteArticle = async (req, res) => {
    const article = await Article.findByIdAndDelete(req.params.id).exec()
    .then( (data) => {
        if (!data) return res.sendStatus(404).send({message : "L'article n'existe pas."});
        res.sendStatus(200).send("Article supprimé.");
    });
}

const storeArticleInJournal = (req, res) => {

}

const getArticlesByAuthor = (req, res) => {

}

const acceptArticle = (req, res) => {

}

module.exports = { create, update, deleteArticle, storeArticleInJournal, getArticlesByAuthor, acceptArticle };