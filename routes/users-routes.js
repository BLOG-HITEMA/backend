const express = require("express");
const { check } = require('express-validator');
const router = express.Router();

const usersControllers = require('../controllers/users-controllers')

router.get('/reconnect', usersControllers.reconnect)

router.post('/signup', [
    check('name').not().isEmpty(),
    check('firstname').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min : 6}),
    check('role').not().isEmpty()
],usersControllers.signup)

router.get('/', usersControllers.getUsers)

router.get('/:id', usersControllers.getUserById)

router.post('/login', usersControllers.login)

router.patch('/:id', usersControllers.updateUser);

router.delete('/:id', usersControllers.deleteUser);

module.exports = router;