'use strict'

const Joi = require('joi');
const validator = require('validator');

const registerDeviceSchema = Joi.object().keys({
    mac_address : Joi.string().required().min(17).max(23).regex(/^[0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){5}$/i),
    name : Joi.string().alphanum().min(2).max(100).required(),
    userId : Joi.string().required(),
    description : Joi.string().max(500),
    modelName : Joi.string().max(100)
});

module.exports.validateDeviceRegistrationData = function(req, res, next){
    console.log(req.body);
    let result = Joi.validate(req.body, registerDeviceSchema, {
        allowUnknown : false,
        abortEarly   : false
    });

    if(result.error){
        res.status(400).end(result.error);
    }else{
        next();
    }
}

module.exports.validateMacAddress = function(req, res, next){

    let mac = req.query.macaddress;

    if(mac && validator.isMACAddress(mac)){
        next();
    }else{
        res.send(400).end({error : "Invalid mac address"});
    }
}