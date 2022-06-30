const Joi = require('joi');
const mongoose = require('mongoose');

const joiSchema = Joi.object({
    title : Joi.string().min(2).max(255).required(),
    content : Joi.string().min(2).max(255).required(),
    published : Joi.boolean(),
    image : Joi.string().optional().allow('').min(2),
    message : Joi.string().optional().allow('').min(2).max(255)
});

const schema = new mongoose.Schema({
    title: String,
    content: String,
    published: Boolean,
    image: String,
    message: String,
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    journal: {
        type: mongoose.Types.ObjectId,
        ref: 'Journal'
    }
});

const Article = mongoose.model('Article', schema);

module.exports = { Article, joiSchema };
