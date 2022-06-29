const {validationResult} = require('express-validator');
const HttpError = require('../models/http-error');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { restart } = require('nodemon');

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

const getUsers = async (req, res, next) => {
    const users = await User.find({});

    res.status(200).json(users);
}

const getUserById = async (req, res, next) => {
    const userId = req.params.id;

    const user = await User.findOne({_id:userId});

    if(!user){
        throw new HttpError("User doesn't exist!" , 404)
    }
    res.status(200).json(user)
}

const updateUser = async (req, res, next) => {
    const id = req.params.id;
    const {name, firstname, password} = req.body;

    const userToUpdate = await User.findOne({_id: id});
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
    userToUpdate.firstname = firstname;
    userToUpdate.password = hashedPassword;
    userToUpdate.name = name;
    try {
        await userToUpdate.save();
    } catch (err) {
        const error = new HttpError(
            "Erreur lors de la modification de l'utilisateur, veuillez ressayer ultérieurement.",
            500
        )
        return next(error);
    }
    res.status(200).json({"message": "Updated"});
}

const deleteUser = async (req, res, nex) => {
    const id = req.params.id;
    const userToDelete = await User.findOne({_id: id});
    
    try {
       await userToDelete.delete();
    } catch (err) {
        const error = new HttpError(
            "Erreur lors de la suppression de l'utilisateur, veuillez ressayer ultérieurement.",
            500
        )
        return next(error);
    }
    res.status(200).json({"message": "Deleted"});
}

const login = async (req, res, next) => {
    const {email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email : email});
    } catch (err) {
        const error = new HttpError(
            'Connexion échouée, veuillez essayer plus tard.',
            500
        )
        return next(error);
    }

    if(!existingUser){
        const error = new HttpError(
            'Données incorrect, vous ne pouvez pas vous connecter',
            403
        )
        return next(error);
    }

    let isValidPassword = false;
    try{
        isValidPassword = await bcrypt.compare(password, existingUser.password);

    }catch(err){
        const error = new HttpError(
            'Données incorrect, vous ne pouvez pas vous connecter',
            500
        )
        return next(error);
    }
    if(!isValidPassword){
        const error = new HttpError(
            'Données incorrect, vous ne pouvez pas vous connecter',
            401
        )
        return next(error);
    }
    
    var token = "";
    try{
        token = jwt.sign(
            {id:existingUser.id, email:existingUser.email},
            process.env.CLE_TOKEN, 
            {expiresIn:'1h'}
        );
    }catch(err){
        const error = new HttpError(
            'Connexion échouée, veuillez essayer plus tard.',
            500
        )
    }
    res.set('Authorization', 'Bearer '+token);
    res.status(200)
    res.json({
        name: existingUser.name,
        firstname: existingUser.firstname,
        email: existingUser.email,
        role : existingUser.role
    })
}

const reconnect = async (req, res, next) => {
    var userData;
    try{
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
        if(!token){
            const error = new HttpError("Pas de token!",401)
            return next(error)
        }
        const decodedToken = jwt.verify(token, process.env.CLE_TOKEN);
        userData = await User.findOne({_id: decodedToken.id});
        if(!userData){
            const error = HttpError("Utilisateur n'existe pas!", 404);
            return next(error)
        }
    }catch(err){
        const error = new HttpError(
            'Pas de TOKEN!',
            401
        )
        return next(error);
    }
    res.status(200).json(userData);
}

exports.reconnect = reconnect;
exports.getUsers = getUsers;
exports.getUserById = getUserById;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.signup = signup;
exports.login = login;
