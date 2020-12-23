const User = require('../models/user');
const formidable = require('formidable');


// Login/Home Page
// Read (user collection)
exports.getHomePage = (req, res) => {
    if (req.session.userid) {
        res.redirect('/read');
    } else {
        res.render('index');
    }
};

// handle user login
// success = redirect to homePage
// fail = redirect to readPage
exports.processLogin = (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        const userid = fields.userid;
        const password = fields.password;
        const user = new User(userid, password);
        user.login((status) => {
            if (status) {
                req.session.userid = userid;
                res.redirect('/read');
            } else {
                res.status(500).render('fail',{
                    action:"Login",
                    errorMessage:"Please try again"
                });
            }
        })
    })
};

// Page to create user
// Create
// Create user accounts
//      - Each user account has a userid and password. 
exports.getRegPage = (req, res) => {
    if (req.session.userid) {
        res.redirect('/read');
    } else {
        res.render('reg');
    }
};

// handle user reg
exports.processReg = (req, res) => {
    // code here
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        const userid = fields.userid;
        const password = fields.password;
        const confirm = fields.confirm;
        //double check by server side
        if (password != confirm || // check password = confirm password
            password == '' || userid == '') {   // check empty input
            res.redirect('/reg');   // if something get wrong, back to /reg
        }
        const user = new User(userid, password);
        user.createNewUser((status) => {
            if (status) {
                req.session.userid = userid;
                res.redirect('/read');
            } else {
                res.status(500).render('fail',{
                    action:"Register",
                    errorMessage:"username existed"
                });
            }
        });
    })
};