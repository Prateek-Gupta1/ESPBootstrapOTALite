'use strict'

var express = require('express');
var router = express.Router();
var multer = require('multer');
var mime = require('mime');
var fs = require('fs');
var Firmware = require('../models/firmwareModel');
var FirmwareImage = require('../models/firmwareImageModel');
var Device = require('../models/deviceModel');
//var config = require('../config/config');

//Defines constraints on the uploaded file
let limits = {
  fieldNameSize   : 255,
  fileSize        : 5000000,
  files           : 1,
  fields          : 7,
};

//Configures where the file is to be stored temporarily
let storage = multer.diskStorage({
  destination : function(req, file, callback){
    callback(null, 'public/uploads');
  },
  filename : function(req, file, callback){
    let filename = file.fieldname + '-' + Date.now()  + '.' + mime.getExtension(file.mimetype);
    console.log(filename);
    callback(null, filename );
  }
});

//Middleware upload handler object
var upload = multer({storage : storage,
   limits : limits, 
   fileFilter : function(req, file, cb){
     console.log(file.mimetype !== 'application/octet-stream');
      if(file.mimetype !== 'application/octet-stream'){
        req.fileValidationError = 'Incorrect file type';
        cb(null, false);
      }else{
        console.log("hello");
        cb(null, true);
      }
  }
}).single('firmwareImg');

router.post('/publish/device/:id', function(req, res, next){
  
  //Upload the file on server and store it temporarily in uploads directory.
  upload(req, res, function(err){
    //If an error occurs while storing file in uploads folder, then return error.
    if(err){ 
      res.status(400).send({message : err});
      return router;
    }

    console.log(req.body);
    //Begin saving firmware info and binary file in MongoDB collection.
    try{    

      //Read the stored file first.
      let filepath = 'public/uploads/' + req.file.filename;
      let fmwBinary = fs.readFileSync(filepath);
      
      //Create Firmware image schema object
      let imageFile = new FirmwareImage({
        image_file : fmwBinary
      });
  
      //Try to save the binary in mongo collections.
      imageFile.storeImage()
      .then(imageId => {
        //Firmware image was stored successfully, delete file from uploads folder.
          fs.unlinkSync(filepath);

          //Get active firmware of the device and change its status to Inactive.
          Firmware.changeActiveFirmwareToInactiveForDevice(req.params.id)
          .then(result => {

                //Create new firmware info object
                let firmwareInfo = new Firmware({
                  version_name : req.body.versionName,
                  name : req.body.fmwName,
                  description  : req.body.description,
                  device  : req.params.id,
                  firmware_image : imageId.id
                });

                //Store the firmware info
                firmwareInfo.publish()
                .then(result => {
                    //Change status of the device to be updatable to give signal about the new firmware.
                    Device.updateStatus(req.params.id, 'Updatable')
                    .then(result => {
                      res.status(200).send({message : 'Firmware published successfully.'});
                    })
                    .catch(err => { //Update Status
                      next(err);
                    });
                })
                .catch(err => { //Publish firmware
                  if(err.name === 'ValidationError'){
                    res.status(400).send(err);
                  }
                  //Unknown error, so pass it on. 
                  next(err);
                });
          })
          .catch(err => { //Change firmware to inactive
            //Unknown error, so pass it on.
            next(err);
          });
      })
      .catch(err => { //Store firmware Image
        //Failed to store firmware image file, so pass the error on.
        next(err);
      });
    }catch(err){ //End of try block
      next(err);
    }
  });
  return router;
});

router.get('/active/device/:id', function(req, res, next){
  
  let deviceId = req.params.id;

  if(!deviceId) {
    res.status(400).send({error : 'Device Id is required but was provided in the url.'});
    return router;
  }

  Firmware.getActiveFirmware(deviceId)
  .then(result => {
    if(!result){  
      res.status(400).send({error : 'Firmware is not uploaded on the device yet.'});

    }else{
      res.status(200).send(result);
    } 
  })
  .catch(err => {
    //Unknown error, so pass it on  
    next(err);
  });

  return router;
});

router.get('/all/device/:id', function(req, res, next){
  
  let deviceId = req.params.id;

  if(!deviceId) {
    res.status(400).send({error : 'Device Id is required but was provided in the url.'});
    return router;
  }

  Firmware.getAllForDevice(deviceId)
  .then(result => {
    if(result){
      res.status(200).send(result);
    } else {
      res.status(204).send({ message : 'Provided device id did not return any results.'});
    }
  })
  .catch(err => {
    next(err);
  });

  return router;
});

router.get('/imagefile/:id', function(req, res, next){

  let imageId = req.params.id;

  if(!imageId){
    res.status(400).send({error : 'Device Id is required but was provided in the url.'});
    return router;
  } 

  FirmwareImage.retrieveImage(imageId)
  .then(result => {
    res.status(200).send(result.image_file);
  })
  .catch(err => {
    next(err);
  });

  return router;
});

module.exports = router;
