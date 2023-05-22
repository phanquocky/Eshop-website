'use strict';

const controller = {};
const models = require('../models');

controller.getData = async (req, res)=>{
    const brands = await models.Brand.findAll({
        include: [{
            model: models.Product
        }]
    })
    res.locals.brands = brands;
    const categories = await models.Category.findAll({
        include: [{
            model: models.Product
        }]
    })
    res.locals.categories = categories;
    const tags = await models.Tag.findAll({});
    res.locals.tags = tags;
}

controller.show = async (req, res) => {
    let category = isNaN(req.query.category) ? -1 : parseInt(req.query.category);
    let brand = isNaN(req.query.brand) ? -1 : parseInt(req.query.brand);
    let tag = isNaN(req.query.tag) ? -1 : parseInt(req.query.tag);
    const sequelize = require('sequelize');
    const Op = sequelize.Op;
    let keyword = req.query.keyword || '';
    let sort = ['price', 'newest', 'popular'].includes(req.query.sort) ? req.query.sort :'price';
    let page = isNaN(req.query.page)?1 : Math.max(1, parseInt(req.query.page));
    await controller.getData(req, res);
    

    const option = {
        attribute: ['id', 'name', 'imagePath', 'stars', 'price', 'oldPrice'],
        where: {}
    }
    if (category > -1) {
        option.where.categoryId = category; 
    }
    if (brand > -1) {
        option.where.brandId = brand;
    }
    if (tag > -1){
        option.include = [{
            model: models.Tag,
            where: {id: tag}
        }]
    }

    res.locals.sort = sort;
    if (Object.keys(req.query).length == 0){
        res.locals.originalUrl = req.originalUrl + "?";
    }
    else {
        res.locals.originalUrl = removeParam('sort', req.originalUrl);
    }
    switch(sort){
        case 'newest':
            option.order = [['createdAt', 'DESC']]
            break;
        case 'popular':
            option.order = [['stars', 'DESC']]
            break;
        default:
            option.order = [['price', 'ASC']]
            
    }


    if (keyword.trim() != ''){
        option.where.name = {
            [Op.iLike]: `%${keyword}%`
        }
    }

    const limit = 6;
    option.limit = limit;
    option.offset = limit * (page - 1);


    const {rows, count} = await models.Product.findAndCountAll(option);
    res.locals.pagination = {
        page: page,
        limit:limit,
        totalRows: count,
        queryParams: req.params
    }
    res.locals.products = rows;

    res.render('product-list');
}

controller.showDetails = async (req, res) => {
    await controller.getData(req, res);
    let id = isNaN(req.params.id)? -1 : parseInt(req.params.id);
    const sequelize = require('sequelize');
    const Op = sequelize.Op;

    let product = await models.Product.findOne({
        attributes: ['id', 'name', 'stars', 'price', 'oldPrice', 'summary', 'specification', 'description'],
        where: {id},
        include: [{
            model: models.Image,
            attributes: ['name', 'imagePath']
        }, {
            model: models.Review,
            attributes: ['id', 'review', 'stars', 'createdAt'],
            include: [{
                model: models.User,
                attribute: ['firstName', 'lastName']
            }]   
        }, {
            model: models.Tag,
            attributes: ['id']
        }]
    });

    let tagIds = [];
    product.Tags.forEach(tag => {tagIds.push(tag.id)});
    
    let relatedProducts = await models.Product.findAll({
        attributes: ['id', 'name', 'imagePath', 'oldPrice', 'price'],
        include: [{
            model: models.Tag,
            attributes: ['id'],
            where: {
                id: {[Op.in]: tagIds}
            }
        }]
    })
    res.locals.relatedProducts = relatedProducts;
    res.locals.product = product;
    res.render('product-detail')
}

function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

module.exports = controller;