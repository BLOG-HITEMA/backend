const HttpError = require('../models/http-error');
const Journal = require('../models/journal');
const User = require('../models/user');
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
    res.status(200).json(journals);
}
const getJournalById = async (req, res, next) => {
    const id = req.params.id;

    const journal = await Journal.findOne({_id:id});

    if(!journal){
        throw new HttpError("Journal n'existe pas!" , 404)
    }
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
exports.getJournals = getJournals;
exports.getJournalById = getJournalById;
exports.createJournal = createJournal;
exports.updateJournal = updateJournal;
exports.deleteJournal = deleteJournal;
