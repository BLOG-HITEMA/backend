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

const createJournal = async (req, res, next) => {
    checkIfAuthor(req.userData.id);
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
            user:user
        })
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
    const id = req.params.id;
    checkIfAuthor(req.userData.id);
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
    
}
const deleteJournal = async (req, res, next) => {
    const id = req.params.id;
    checkIfAuthor(req.userData.id);
    const newData = req.body;
    let journal;
    try {
        journal = await Journal.findById(id);
    } catch (err) {
        const error = new HttpError(
            'La suppréssion du journal a échouée, résseyez utérieurement',
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
}

const checkIfAuthor = async (id) => {
    let user;
    try {
        user = await User.findById(id);
    } catch (err) {
        const error = new HttpError(
            'La création du journal a échouée, résseyez utérieurement',
            500
        );
        return next(error);
    }
    if(!user){
        const error = new HttpError(
            "L'utilisateur est introuvable.",
            404
        );
        return next(error);
    }
    if(user.role=="author"){
        const error = new HttpError(
            "Vous n'êtes pas autorisé pour créer un journal",
            403
        );
        return next(error);
    }
}
exports.updateJournal = updateJournal;
exports.getJournals = getJournals;
exports.createJournal = createJournal;
