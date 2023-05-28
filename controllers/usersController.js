'use strict'

const controller = {};
const models = require('../models')
controller.checkout = async (req, res) => {
    if (req.session.cart.quantity > 0){

        let userId = 1;
        res.locals.addresses = await models.Address.findAll({where: {userId}})
        console.log(new Date())
        res.locals.cart = req.session.cart.getCart();
        return res.render('checkout');
    }else{
        res.redirect('/products');
    }
}

module.exports = controller;