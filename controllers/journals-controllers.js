const HttpError = require('../models/http-error');
const Journal = require('../models/journal');
const User = require('../models/user');
const {Article} = require('../models/article');
const { validationResult } = require('express-validator')

const getJournals = async (req, res, next) => {
    const journals = await Journal.find({});
    if(journals.length == 0){
        const error = new HttpError(
            "Il n'ya pas de journal pour le moment" , 
            404
        )
        return next(error);
    }
    let data = await Promise.all(journals.map(async (journal) => {
        const user = await User.findOne({_id: journal.user});
        delete user.password;
        journal.user=user;
        journal.articles = await Article.find({journal: journal._id})
    }))
    res.status(200).json(journals);
}
const getJournalById = async (req, res, next) => {
    const id = req.params.id;

    const journal = await Journal.findOne({_id:id});
    const user = await User.findOne({_id: journal.user});
    const articles = await Article.find({journal: journal._id})
    if(!journal){
        const err = HttpError("Journal n'existe pas!" , 404)
        return next(err)
    }
    if(!user){
        const err = HttpError("User n'existe pas!" , 404)
        return next(err)
    }
    delete user.password;
    journal.user=user;
    journal.articles=articles;
    res.status(200).json(journal)
}
const createJournal = async (req, res, next) => {
    const role = await getUserRole(req.userData.id);
    if(role == "author"){
        return res.status(403).send({"message": "Vous n'êtes pas autorisé!"})
    }
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new HttpError(
            "Les données envoyées sont incorrectes, veuillez vérifier les données envoyés." , 
            422
        )
        return next(error);
    }
    const {title} = req.body;

    let createdJournal;
    try {
        createdJournal = new Journal({
            title,
            user:req.userData.id
        })
        await createdJournal.save();
    } catch (err) {
        const error = new HttpError(
            'La création du journal a échouée, ressayez utérieurement',
            500
        );
        return next(error)
    }
    res.status(201).json(createdJournal)
}
const updateJournal = async (req, res, next) => {
    const role = await getUserRole(req.userData.id);
    if(role == "author"){
        return res.status(403).send({"message": "Vous n'êtes pas autorisé!"})
    }
    const id = req.params.id;
    const newData = req.body;
    let journal;
    try {
        journal = await Journal.findById(id);
    } catch (err) {
        const error = new HttpError(
            'La modification du journal a échouée, résseyez utérieurement',
            500
        );
        return next(error);
    }
    if(!journal){
        const error = new HttpError(
            "Le journal est introuvable.",
            404
        );
        return next(error);
    }
    try {
        journal.title = newData.title;
        journal.articles = newData.articles;
        journal.save()
    } catch (err) {
        const error = new HttpError(
            'La modification du journal a échouée, résseyez utérieurement',
            500
        );
        return next(error);
    }
    res.status(201).json(journal)
}
const deleteJournal = async (req, res, next) => {
    const role = await getUserRole(req.userData.id);
    if(role == "author"){
        return res.status(403).send({"message": "Vous n'êtes pas autorisé!"})
    }
    const id = req.params.id;
    let journal;
    try {
        journal = await Journal.findById(id);
    } catch (err) {
        const error = new HttpError(
            'La suppression du journal a échouée, résseyez utérieurement',
            500
        );
        return next(error);
    }
    if(!journal){
        const error = new HttpError(
            "Le journal est introuvable.",
            404
        );
        return next(error);
    }
    try {
        await journal.delete();
    } catch (err) {
        const error = new HttpError(
            'La suppréssion du journal a échouée, résseyez utérieurement',
            500
        );
        return next(error);
    }
    res.status(200).json("Journal bien supprimé.")

}
const getUserRole= async (id) => {
    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        console.log('La création du journal a échouée, réessayez utérieurement')
    }
    if(!user){
        console.log("L'utilisateur est introuvable.");
    }
    return user.role;
}

const getJournalByEditor = async (req, res, next) => {
    const idEditor = req.params.id;
    const user = await User.findOne({_id: idEditor});
    if(!user){
        const err = HttpError("L'éditeur n'existe pas!" , 404)
        return next(err)
    }
    const journal = await Journal.findOne({user:idEditor});
    if(!journal){
        const err = new HttpError("Journal n'existe pas!" , 404)
        return next(err)
    }

    const articles = await Article.find({journal: journal._id})
    
    journal.user=user;
    journal.articles=articles;
    res.status(200).json(journal)
}

const getUnpublishedArticlesOfMyJournals = async (req, res, next) => {
    // const userID = req.userData.id;

    // const journaux = await Journal.find({user : userID});
    // let articles = [];

    // let datas = await Promise.all(journaux.map(async (journal) => {
    //     articles = await Article.find({journal: journal._id, published: false});
    //     journal.articles = articles;
    // }))
    
    res.status(200).send("journaux");
}

exports.getJournals = getJournals;
exports.getJournalById = getJournalById;
exports.createJournal = createJournal;
exports.updateJournal = updateJournal;
exports.deleteJournal = deleteJournal;
exports.getJournalByEditor = getJournalByEditor;
exports.getUnpublishedArticlesOfMyJournals = getUnpublishedArticlesOfMyJournals;
