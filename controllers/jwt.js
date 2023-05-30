'use strict'

const jwt = require('jsonwebtoken')

function sign (email, expiresIn='30m'){
    return jwt.sign({email}, process.env.JWT_SECRET || 'jwt_secret', {expiresIn})
}

function verify (token){
    try{
        jwt.verify(token,process.env.JWT_SECRET || 'jwt_secret' )
        return true;
    }catch (error){
        return false;
    }
}
module.exports = {sign, verify}