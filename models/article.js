const Joi = require('joi');
const mongoose = require('mongoose');

const joiSchema = Joi.object({
    title : Joi.string().min(2).max(255).required(),
    content : Joi.number().required()
});

const schema = new mongoose.Schema({
    title: String,
    content: String,
    published: Boolean,
    image: String,
    message: String
});

const Article = mongoose.model('Article', schema);

module.exports = { Article, joiSchema };
