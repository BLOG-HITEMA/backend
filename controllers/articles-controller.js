const { Article, joiSchema } = require('../models/article');
const User = require('../models/user');

const create = async (req, res) => {
    const payload = req.body;
    const { error } = joiSchema.validate(payload);
    if (error) return res.sendStatus(400).send(error.details[0].message);

    let user = null;

    // if (payload.token) {
    //     const decoded = jwt.verify(payload.token, process.env.CLE_TOKEN);
    //     // user = await User.findById(decoded.id);
    //     user = await User.findById("62bafd1c8b3edd047ac35c7b");
    // }

    user = await User.findById("62bafd1c8b3edd047ac35c7b");

    const article = new Article({
        title: payload.title,
        content: payload.content,
        published: payload.published,
        image: payload.image,
        message: payload.message,
        user: user._id
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
    const author = req.params.id;
    console.log(Article.find());
    // Article.find({user: author}).exec()
    // .then( (data) => {
    //     if (!data) return res.sendStatus(404).send({message : "Aucun article trouvé."});
    //     res.status(200).send(data);
    // }).catch( (err) => {
    //     res.status(500).send({message : "Erreur lors de la récupération des articles."});
    // } );
}

const acceptArticle = (req, res) => {
    const { message } = req.body;
    const accept = req.params.accept;
    const id = req.params.idArticle;

    if (accept != 0) {
        Article.findByIdAndUpdate(id, {published: true, message: message}).exec()
        .then( (data) => {
            if (!data) return res.sendStatus(404).send({message : "L'article n'existe pas."});
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