const express = require("express");
const { check } = require('express-validator');
const router = express.Router();

const usersControllers = require('../controllers/users-controllers')

router.post('/signup', [
    check('name').not().isEmpty(),
    check('firstname').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({min : 6}),
    check('role').not().isEmpty()
],usersControllers.signup)

module.exports = router;