require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const routes = require('./routes/routes');
const methodOverride = require('method-override');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/nodeblog_db')
.then(() => console.log('Connesso a MongoDB'))
.catch(err => console.error('Errore di connessione a MongoDB:', err));

const app = express();
const port = process.env.PORT || "3000";

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
app.use('/assets', express.static('node_modules'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'nicolasghiggi',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.use('/', routes);

app.use('*', (req, res) => {
    res.status(404).render('error', {
        title: 'Error 404 - Page Not Found',
        message: 'The page you\'re looking for doesn\'t exist or has been moved.'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Error 500 - Internal Server Error',
        message: 'Something went wrong on the server.'
    });
});


app.listen(port, () => console.log(`Server active on port number ${port}`));
