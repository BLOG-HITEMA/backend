const { Article, joiSchema } = require('../models/article');
const User = require('../models/user');
const { Journal } = require('../models/journal');
const jwt = require('jsonwebtoken');

const create = async (req, res) => {
    const payload = req.body;
    const token = req.body.token;

    delete payload.token;

    const { error } = joiSchema.validate(payload);
    if (error) return res.status(400).send({message : error.details[0].message});

    let user = null;
    let article = null;

    if (token) {
        const decoded = jwt.verify(token, process.env.CLE_TOKEN);
        user = await User.findById(decoded.id).exec()
            .then( async (data) => {
                if (!data) {
                    
                    article = new Article({
                        title: payload.title,
                        content: payload.content,
                        published: payload.published,
                        image: payload.image,
                        message: payload.message,
                    });
    
                    await article.save();
                }

                else {
                    article = new Article({
                        title: payload.title,
                        content: payload.content,
                        published: payload.published,
                        image: payload.image,
                        message: payload.message,
                        user: data._id
                    });
        
                    await article.save();
                }
    
            })
        ;

        return res.status(201).send(article);
    }

    res.status(400).send({message : "L'auteur n'a pas été préciser."});
}

const update = async (req, res) => {
    const payload = req.body;
    const { error } = joiSchema.validate(payload);
    if (error) return res.status(400).send({message : error.details[0].message});

    const article = await Article.findByIdAndUpdate(req.params.id, payload);
    if (!article) return res.status(404).send({message : "L'article n'existe pas."});

    res.status(200).send({ _id : article._id, ...payload});
}

const deleteArticle = async (req, res) => {
    const article = await Article.findByIdAndDelete(req.params.id).exec()
    .then( (data) => {
        if (!data) return res.status(404).send({message : "L'article n'existe pas."});
        res.status(200).send("Article supprimé.");
    });
}

const storeArticleInJournal = async (req, res) => {
    const { idJournal, idArticle } = req.params;

    const journal = await Journal.findById(idJournal);
    const article = await Article.findByIdAndUpdate(idArticle, {journal: idJournal});

    if (!journal) return res.status(404).send({message : "Le journal n'existe pas."});

    if (!article) return res.status(404).send({message : "L'article n'existe pas."});

    journal.articles.push(article);

    await journal.save();

    res.status(200).send("L'article a été ajouter au journal.");
}

const getArticlesByAuthor = async (req, res) => {
    const author = req.params.id;

    const user = await User.findById(author);

    if (!user) return res.status(404).send({message : "L'utilisateur n'existe pas."});

    const articles = await Article.find({user: author});

    if (!articles) return res.status(404).send({message : "Aucun article n'a été trouvé."});
    
    res.status(200).send(articles);
}

const acceptArticle = (req, res) => {
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
        Article.findByIdAndUpdate(id, {published: false, message: message}).exec()
        .then( (data) => {
            if (!data) return res.status(404).send({message : "L'article n'existe pas."});
            res.status(200).send("Article refusé.");
        }).catch( (err) => {
            res.status(500).send({message : "Erreur lors de la publication de l'article."});
        } );
    }
}

module.exports = { create, update, deleteArticle, storeArticleInJournal, getArticlesByAuthor, acceptArticle };