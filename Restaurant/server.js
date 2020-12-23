const express = require('express');
const app = express();
const session = require('cookie-session');

const mongodbConnect = require('./utils/db').mongodbConnect;
const restaurantApiRoutes = require('./routes/api.js');
const userRoutes = require('./routes/user');
const restaurantRoutes = require('./routes/restaurnt');
const key1 = "ui3bqoithj2q4piofmnlskdanmgvm#Q$ty'p1o03jgp'dfbvmdZ:Fmb";
const key2 = "ifhaosihguiqwgrh98vhnoi3n4tgh309123-.1-3123-o1-.412-312";

// handler for RESTful services
// not sure is it correct

app.use('/api',restaurantApiRoutes);

// end of handler for RESTful services

// set default engine to view ejs
app.set('view engine', 'ejs');
app.use(session({
    name: 'user',
    keys: [key1, key2],
    maxAge: 24 * 60 * 60 * 1000 //24h * 60m * 60s * 1000ms = 24hours
}))

// routes for login and register
app.use(userRoutes);

//if not requiring homepage or register page, check cookie
app.use('*', (req, res, next) => {
    if (!req.session.userid) {
        //userid is empty
        req.session = null;
        res.redirect('/');
    } else {
        //userid is not empty
        next();
    }
})


app.use(restaurantRoutes);



mongodbConnect(() => {
    app.listen(process.env.PORT || 8099);
});