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
    res.send(article);
}

module.exports = { create };