'use strict';

const express= require('express');
const app = express();
const expressHandlebars = require('express-handlebars')
const {createStarList} = require('./controllers/handlebarsHelper');
const {createPagination} = require('express-handlebars-paginate');
const session = require('express-session');
const passport = require('./controllers/passport');
const flash = require('connect-flash');
require('dotenv').config()
const redisStore = require('connect-redis').default;
const {createClient} = require('redis');
const redisclient = createClient({
    url: "redis://red-chrj4s9mbg5e1f72ppkg:6379"
});
redisclient.connect().catch(console.error);
app.use(express.static(__dirname + '/public'));
app.use(express.json())
app.use(express.urlencoded({extends: false}));

app.engine('hbs', expressHandlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
    },
    helpers: {
        createStarList,
        createPagination
    }
}));
app.set("view engine", 'hbs');

app.use(session({
    secret: 'S3cret',
    store: new redisStore({client: redisclient}),
    resave: false,
    saveUninitialized: false,
    cookie:{
        httpOnly: true,
        maxAge: 20 * 60 * 1000 // 20p
    }
}))

//config passport
app.use(passport.initialize());
app.use(passport.session())

// config connect - flash
app.use(flash());

//middle ware init cart
app.use((req, res, next) => {
    let Cart = require("./controllers/cart");
    req.session.cart = new Cart(req.session.cart ? req.session.cart : {});
    res.locals.quantity = req.session.cart.quantity;

    res.locals.isLoggedIn = req.isAuthenticated();
    next(); 
})

// routes
app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));
app.use('/users', require('./routes/authRouter'));
app.use('/users', require('./routes/userRouter'));
app.use((req, res, next) => {
    res.status(404).render('error', {message: "File not foud!"});
})

app.use((error, req, res, next) => {
    console.log(error);
    res.status(500).render("error", {message: "Internal error"});
})

// start 
const port = process.env.PORT || 5000;
app.listen(port, ()=>{
    console.log(`Server is listening on port: ${port}`);
})