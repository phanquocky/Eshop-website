'use strict';

const { update } = require('../controllers/cartController');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const models = require('../models');
        const bcrypt = require('bcrypt');

        // update hashpassword
        let users = await models.User.findAll();
        let updateUsers = [];
        users.forEach(item => {
            updateUsers.push({
                id: item.id,
                password: bcrypt.hashSync("Demo@123", 8)
            });
        });
        await models.User.bulkCreate(updateUsers, {
            updateOnDuplicate: ['password']
        })
    },

    async down(queryInterface, Sequelize) {

    }
};
