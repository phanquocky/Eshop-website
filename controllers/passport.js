'use strict'

const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const models = require('../models')

passport.serializeUser((user, done) => {
    done(null, user.id);

})

passport.deserializeUser( async (id, done)=> {
    try{
        let user = await models.User.findOne({
            attributes: ['id', 'email', 'firstName', 'lastName', 'mobile', 'isAdmin'],
            where: {id}
        })
        done(null, user)

    }
    catch(error){
        done(error, null)

    }
})


passport.use('local-login', new LocalStrategy({
    usernameField: "email",
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done)=> {
    if (email){
        email = email.toLowerCase(); 
    }
    try{
        console.log("email", email, "password", password)
        if (!req.user) {
            let user = await models.User.findOne({where: {email}});
            if (!user) { // email chưa tồn tại
                return done(null, false, req.flash('loginMessage', "Email doesn't exist!"))
            }
            if (!bcrypt.compareSync(password, user.password)){ // nếu mật khẩu không khớp
                return done(null, false, req.flash('loginMessage', "Invalid password!"))
            }
            return done(null, user)
        }
        // bypass login
    }catch(error){
        done(error)
    }
}))

passport.use('local-register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase();
    }
    if (req.user) {
        return done(null, req.user)
    }
    try{
        let user = await models.User.findOne({where: {email}})
        
        if (user){
            return done(null, false, req.flash("registerMessage", 'Email is already taken!'));
        }

        user = await models.User.create({
            email: email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile
        });

        done(null, false, req.flash("registerMessage", "You have registerd successfully. Please login!"))
    }catch (error){
        done(error)
    }
}))

module.exports = passport;