

const express = require('express');

const router = express.Router();
const multer = require('multer');
const mime = require('mime');
const fs = require('fs');
const Firmware = require('../models/firmwareModel');
const FirmwareImage = require('../models/firmwareImageModel');
const Device = require('../models/deviceModel');
// var config = require('../config/config');

// Defines constraints on the uploaded file
const limits = {
  fieldNameSize: 255,
  fileSize: 5000000,
  files: 1,
  fields: 7,
};

// Configures where the file is to be stored temporarily
const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, 'public/uploads');
  },
  filename(req, file, callback) {
    const filename = `${file.fieldname}-${Date.now()}.${mime.getExtension(file.mimetype)}`;
    callback(null, filename);
  },
});

// Middleware upload handler object
const upload = multer({
  storage,
  limits,
  fileFilter(req, file, cb) {
    if (file.mimetype !== 'application/octet-stream') {
      req.fileValidationError = 'Incorrect file type';
      cb(null, false);
    } else {
      cb(null, true);
    }
  },
}).single('firmwareImg');

router.post('/publish/device/:id', (req, res, next) => {
  // Upload the file on server and store it temporarily in uploads directory.
  upload(req, res, (err) => {
    // If an error occurs while storing file in uploads folder, then return error.
    if (err) {
      res.status(400).send({ message: err });
      return router;
    }

    // Begin saving firmware info and binary file in MongoDB collection.
    try {
      // Read the stored file first.
      const filepath = `public/uploads/${req.file.filename}`;
      const fmwBinary = fs.readFileSync(filepath);

      // Create Firmware image schema object
      const imageFile = new FirmwareImage({
        image_file: fmwBinary,
      });

      // Try to save the binary in mongo collections.
      imageFile.storeImage()
        .then((imageId) => {
        // Firmware image was stored successfully, delete file from uploads folder.
          fs.unlinkSync(filepath);

          // Get active firmware of the device and change its status to Inactive.
          Firmware.changeActiveFirmwareToInactiveForDevice(req.params.id)
            .then(() => {
              // Create new firmware info object
              const firmwareInfo = new Firmware({
                version_name: req.body.versionName,
                name: req.body.fmwName,
                description: req.body.description,
                device: req.params.id,
                firmware_image: imageId.id,
              });

                // Store the firmware info
              firmwareInfo.publish()
                .then(() => {
                  // Changing device status to signal that an update is available.
                  Device.updateStatus(req.params.id, 'Updatable')
                    .then(() => {
                      res.status(200).send({ message: 'Firmware published successfully.' });
                    })
                    .catch((er) => { // Update Status
                      next(er);
                    });
                })
                .catch((er) => { // Publish firmware
                  if (er.name === 'ValidationError') {
                    res.status(400).send(er);
                  }
                  // Unknown error, so pass it on.
                  next(er);
                });
            })
            .catch((er) => { // Change firmware to inactive
            // Unknown error, so pass it on.
              next(er);
            });
        })
        .catch((er) => { // Store firmware Image
        // Failed to store firmware image file, so pass the error on.
          next(er);
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

  Firmware.getActiveFirmware(deviceId)
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
    res.status(400).send({ error: 'Device Id is required but was provided in the url.' });
    return router;
  }

  Firmware.getAllForDevice(deviceId)
    .then((result) => {
      if (result) {
        res.status(200).send(result);
      } else {
        res.status(204).send({ message: 'Provided device id did not return any results.' });
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
    res.status(400).send({ error: 'Device Id is required but was provided in the url.' });
    return router;
  }

  FirmwareImage.retrieveImage(imageId)
    .then((result) => {
      res.status(200).send(result.image_file);
    })
    .catch((err) => {
      next(err);
    });

  return router;
});

module.exports = router;
