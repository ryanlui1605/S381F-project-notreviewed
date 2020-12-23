const express = require('express');

const userController = require('../controllers/user');

const router = express.Router();

router.get('/', userController.getHomePage);

router.post('/processlogin', userController.processLogin);

router.get('/reg', userController.getRegPage);

router.post('/processReg', userController.processReg);

module.exports = router;