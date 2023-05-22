'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/indexController');

router.get('/', controller.showHomePage)
router.get('/create-table', (req, res)=> {
    let models = require("../models");
    models.sequelize.sync().then(()=>{
        res.send("tables created!");
    })
})

router.get('/:page', controller.showPage)

module.exports = router;