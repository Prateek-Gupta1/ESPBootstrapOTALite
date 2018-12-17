

const express = require('express');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const mime = require('mime');
const fs = require('fs');
const Device = require('../models/deviceModel');
var FirmwareManager = require('../services/firmware');
const userAuth = require('../middlewares/authentication/userauth');

const manager = new FirmwareManager();

// Defines constraints on the uploaded file
const limits = {
  fieldNameSize: 255,
  fileSize: 6000000,
  files: 1,
  fields: 7,
};

// Configures where the file is to be stored temporarily
const storage = multer.diskStorage({
  destination(req, file, callback) {
    //console.log(path.resolve(__dirname, 'public/uploads'));
    callback(null, path.resolve(__basedir, 'public/uploads'));
  },
  filename(req, file, callback) {
    const filename = `${file.fieldname}-${Date.now()}.${mime.getExtension(file.mimetype)}`;
   // console.log(filename);
    callback(null, filename);
  },
});

// Middleware upload handler object
const upload = multer({
  storage,
  limits,
  fileFilter(req, file, cb) {
    //console.log(file);
    let validMimes = ['application/octet-stream', 'application/macbinary', 'application/mac-binary','application/x-binary','application/x-macbinary']
    if (validMimes.indexOf(file.mimetype) === -1) {
      req.fileValidationError = 'Incorrect file type';
      cb({err: "Incorrect file type"}, false);
    } else {
      cb(null, true);
    }
  },
}).single('firmwareImg');

router.use(userAuth.authenticate);

router.post('/publish/device', (req, res, next) => {
  // Upload the file on server and store it temporarily in uploads directory.
  upload(req, res, (err) => {
    // If an error occurs while storing file in uploads folder, then return error.
    if (err) {
      res.status(400).send({ message: err });
      return router;
    }
   
    const filepath = `public/uploads/${req.file.filename}`;
    // Begin saving firmware info and binary file in MongoDB collection.
    try {
      let imageId = '';
      
      // Read the binary from temporary location.
      const fmwBinary = fs.readFileSync(filepath);

      // Persist the binary. 
      manager.storeFirmwareImage(fmwBinary)
      .then(id => {

        // Delete the binary from temporary location.
        fs.unlinkSync(filepath);

        // Get and store ID of the newly stored binary.
        imageId = id;

        // Archive the previously active firmware.
        manager.archivePreviousFirmwareOfDevice(req.params.id);
      })
      .then(() => {
        // Extract firmware info.
        const firmwareInfo = {
          versionName: req.body.versionName,
          fmwName: req.body.fmwName,
          description: req.body.description,
          deviceId: req.body.deviceId,
          imgId: imageId.id,
        };

        // Store the firmware info in DB.
        manager.publishFirmwareInfo(firmwareInfo)
      })
      .then(() => {
        // Update device status to signal that a new firmware is available.
        Device.updateStatus(req.params.id, 'Updatable')
      })
      .then(() => {
        // All steps passed, send user success message.
        res.status(200).send({ message: 'Firmware published successfully.' });
      })
      .catch( (error) => {
        if (error.name === 'ValidationError') {
          res.status(400).send(er);
        }else{
          next(error);
        }
      });
    } catch (er) { // End of try block
      next(er);
    }
    return router;
  });
});


router.get('/active/device/:id', (req, res, next) => {
  const deviceId = req.params.id;

  if (!deviceId) {
    res.status(400).send({ error: 'Device Id is required but was provided in the url.' });
    return router;
  }

  manager.getActiveFirmwareForDevice(deviceId)
    .then((result) => {
      if (!result) {
        res.status(400).send({ error: 'Firmware is not uploaded on the device yet.' });
      } else {
        res.status(200).send(result);
      }
    })
    .catch((err) => {
    // Unknown error, so pass it on
      next(err);
    });

  return router;
});

router.get('/all/device/:id', (req, res, next) => {
  const deviceId = req.params.id;

  if (!deviceId) {
    res.status(400).send({ error: 'Device Id is required.' });
    return router;
  }

  manager.listAllFirmwaresForDevice(deviceId)
    .then((result) => {
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(204).send({ message: 'No results found for given Device ID' });
      }
    })
    .catch((err) => {
      next(err);
    });

  return router;
});

router.get('/imagefile/:id', (req, res, next) => {
  const imageId = req.params.id;

  if (!imageId) {
    res.status(400).send({ error: 'Image Id is required.' });
    return router;
  }

  manager.getFirmwareBinary(imageId)
    .then((result) => {
      res.status(200).send(result.image_file);
    })
    .catch((err) => {
      next(err);
    });

  return router;
});

router.get('/ota/update/device/:id', (req, res, next) => {
  const deviceId = req.params.id;
  if (!deviceId) {
    res.status(400).send({ error: 'Device Id is required.' });
    return router;
  }

  manager.getActiveFirmwareForDevice(deviceId)
  .then((result) => {
    if(result){
      console.log(result);
      manager.getFirmwareBinary(result[0].firmware_image)
      .then((file) => {
        if(file){
          res.status(200).send(file.image_file);
        }else{
          res.status(404).send({error: "Resource not found."});
        }
      })
    }else{
      res.status(404).send({error: "Resource not found."});
    }
  })
  .catch((err) => {
    next(err);
  });

  return router;
});

module.exports = router;
