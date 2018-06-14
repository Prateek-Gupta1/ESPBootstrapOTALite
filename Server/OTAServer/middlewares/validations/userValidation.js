'use strict'

const Joi = require('joi').extend(require('joi-phone-number'));

const createUserSchema = Joi.object().keys({
    name : Joi.string().alphanum().min(2).max(100).required(),
    email : Joi.string().email().required(),
    password : Joi.string().min(3).max(100).required(),
    phone : Joi.string().phoneNumber().required()
});

const authUserSchema = Joi.object().keys({
    email : Joi.string().email().required(),
    password : Joi.string().min(3).max(100).required()
});

module.exports.validateUserRegistrationData = function(req, res, next){
    console.log(req.body);
    let result = Joi.validate(req.body, createUserSchema, {
        allowUnknown : false,
        abortEarly   : false
    });

    if(result.error){
        console.log(result);
        res.status(400).end(result.error);
    }else{
        next();
    }
}

module.exports.validateUserLoginData = function(req, res, next){
    let result = Joi.validate(req.body, authUserSchema, {
        allowUnknown : false,
        abortEarly   : false
    });

    if(result.error){
        res.status(400).end(result.error);
    }else{
        next();
    }
}
