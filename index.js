'use strict';

const express= require('express');
const app = express();
const expressHandlebars = require('express-handlebars')
const {createStarList} = require('./controllers/handlebarsHelper');
const {createPagination} = require('express-handlebars-paginate');
app.use(express.static(__dirname + '/public'));

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


app.use('/', require('./routes/indexRouter'));
app.use('/products', require('./routes/productsRouter'));

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