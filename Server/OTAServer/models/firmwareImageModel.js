'use strict'

var mongoose = require('mongoose');

const TAG = 'FirmwareImagesModel';

var collectionName = 'FirmwareImages';

let firmwareImageSchema = new mongoose.Schema({
    //_id : mongoose.Schema.Types.ObjectId,
    image_file : {
        type : Buffer,
        required : true,
    }
});

firmwareImageSchema.methods.storeImage = function(){

    return new Promise((resolve, reject) => {

        this.save(function(err, object){
            if(err) return reject(err);
            resolve({id : object._id});
        })
    });
}

firmwareImageSchema.statics.retrieveImage = function(id){

    return new Promise((resolve, reject) => {

        this.findOneById(id, {_id : 0}, function(err, result){
            if(err) return reject(err);
            resolve(result);
        });
    });
}

firmwareImageSchema.statics.removeImage() = function(){
    return new Promise((resolve, reject) => {
        
    });
};

module.exports = mongoose.model(collectionName, fimwareImageSchema);