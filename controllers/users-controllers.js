const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const signup = async (req, res , next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return next(
            new HttpError("Veuillez vérifier les données que vous souhaitez ajouter", 422)
        );
    }
    const { name, firstname, email, password, role } = req.body;
    let existingUser;
    try {
        existingUser = await User.findOne({email : email});
    } catch (err) {
        const error = new HttpError(
            'Erreur lors de la création du compte, veuillez ressayer ultérieurement.',
            500
        )
        return next(error);
    }
    if(existingUser){
        const error = new HttpError(
            "L'utilisateur existe déjà, veuillez vous connecter.",
            422
        )
        return next(error);
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12);

    }catch(err){
        const error = new HttpError(
            'Erreur lors de la création du compte, veuillez ressayer ultérieurement.',
            500
        )
        return next(error);
    }

    const createdUser = new User({
        name,
        firstname,
        email,
        role,
        password: hashedPassword,
    })
    try {
        await createdUser.save();
    } catch (err) {
        const error = new HttpError(
            'Erreur lors de la création du compte, veuillez ressayer ultérieurement.',
            500
        )
        return next(error);
    }

    res.status(201).send({"message": "CREATED"});
}

const getUserByName = async (req, res, next) => {
    const userName = req.params.name;

    const user = await User.findOne({name:userName});

    if(!user){
        throw new HttpError("User doesn't exist!" , 404)
    }
    res.status(200).json(user)
}

exports.signup = signup;
exports.getUserByName = getUserByName;
