
const express = require('express');

const router = express.Router();
const DeviceManager = require('../services/device');
const Validation = require('../middlewares/validations/deviceValidation');


const manager = new DeviceManager();
// const TAG = 'DeviceController';

router.post('/register', Validation.validateDeviceRegistrationData, (req, res, next) => {
  const device = {
    mac_address: req.body.mac_address,
    name: req.body.name,
    userId: req.body.userId,
    description: req.body.description,
    modelName: req.body.modelName,
  };

  manager.register(device)
    .then((result) => {
      if (result) {
        res.status(200).send('Device registered successfully.');
      } else {
        res.status(500).send({ error: 'Internal server error' });
      }
    })
    .catch((err) => {
    // Check if it is validation error
      if (err.name === 'ValidationError') {
        res.status(400).send(err);
      }
      // Unknown error, so pass it on.
      next(err);
    });

  return router;
});

router.get('/user/:id', (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).send({ error: 'user id not provided' });
  }

  manager.listAllDevicesforUser(userId)
    .then((result) => {
      if (result) res.status(200).send(result);
      else res.status(204).send({ message: 'Provided user id did not return any results.' });
    })
    .catch((err) => {
      // Check if it is validation error
      if (err.name === 'ValidationError') {
        res.status(400).send(err);
      }
      // Unknown error, so pass it on
      next(err);
    });

  return router;
});


router.get('/mac', Validation.validateMacAddress, (req, res, next) => {
  const macAddress = req.query.macaddress;
  manager.getDeviceInfoForMac(macAddress)
    .then((result) => {
      if (result) res.status(200).send(result);
      else res.status(204).send({ message: 'Provided mac address did not return any results.' });
    })
    .catch((err) => {
      // Check if it is validation error
      if (err.name === 'ValidationError') {
        res.status(400).send(err);
      }
      // Unknown error, so pass it on
      next(err);
    });

  return router;
});

router.get('/id/:id', (req, res, next) => {
  const deviceId = req.params.id;

  if (!deviceId) {
    return res.status(400).send({ error: 'Invalid device id' });
  }

  manager.getDeviceInfoForId(deviceId)
    .then((result) => {
      if (result) res.status(200).send(result);
      else res.status(204).send({ message: 'Provided device id did not return any results.' });
    })
    .catch((err) => {
      // Check if it is validation error
      if (err.name === 'ValidationError') {
        res.status(400).send(err);
      }
      // Unknown error, so pass it on
      next(err);
    });

  return router;
});

module.exports = router;
