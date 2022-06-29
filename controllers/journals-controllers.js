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
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const error = new HttpError(
            "Les données envoyées sont incorrectes, veuillez vérifier les données envoyés." , 
            422
        )
        return next(error);
    }
    const {title} = req.body;

    
    let user;
    try {
        user = await User.findById(req.userData.id);
    } catch (err) {
        const error = new HttpError(
            'La création du journal a échouée, resseyez utérieurement',
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
    try {
        const createdJournal = new Journal({
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

exports.getJournals = getJournals;
exports.createJournal = createJournal;
