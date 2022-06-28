const Joi = require('joi');
const mongoose = require('mongoose');

const joiSchema = Joi.object({
    title : Joi.string().min(2).max(255).required()
});

const schema = new mongoose.Schema({
    title: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    articles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Article'
        }
    ]
});

const Journal = mongoose.model('Journal', schema);

module.exports = { Journal, joiSchema };
