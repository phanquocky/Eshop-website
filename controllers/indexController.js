'use strict';

const controller  = {
};
const models = require('../models')
controller.showHomePage = async (req, res) => {
    const recentProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath','stars', 'price', 'oldPrice' ],
        order: [['createdAt', 'DESC']],
        limit: 10
    })
    res.locals.recentProducts = recentProducts;


    const featureProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
        order: [['stars', 'DESC']],
        limit: 10
    });
    res.locals.featureProducts = featureProducts;

    const Brand = models.Brand; 
    const brands = await Brand.findAll();
    const Category = models.Category;
    const categories = await Category.findAll();
    const secondArray = categories.splice(2,2);
    const thirdArray = categories.splice(1,1);
    res.locals.categoryArray = [
        categories,
        secondArray,
        thirdArray
    ];
    res.render('index', {brands});
}
controller.showPage = (req, res, next) => {
    const pages = ['cart', 'checkout', 'contact', 'index', 'login', 'my-account', 'product-detail', 'product-list', 'wishlist'];
    if (pages.includes(req.params.page))
        res.render(req.params.page);
    else next();
}
module.exports = controller;