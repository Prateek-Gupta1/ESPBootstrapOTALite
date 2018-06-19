

const mongoose = require('mongoose');
const validator = require('validator');

const collectionName = 'Devices';

//const TAG = 'deviceModel';

const deviceSchema = new mongoose.Schema({
  mac_address: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator(macAddress) {
        return validator.isMACAddress(macAddress);
      },
      message: 'Invalid mac address',
    },
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
    maxlength: 40,
    trim: true,
  },
  description: {
    type: String,
    maxlength: 200,
    trim: true,
    default: 'No description provided.',
  },
  model: {
    type: String,
    maxlength: 40,
    trim: true,
  },
  registeredOn: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Active', 'Sleep', 'Dead', 'Updatable'],
    default: 'Active',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
});

deviceSchema.methods.register = function () {
  // Return promise
  return new Promise((resolve, reject) => {
    // try to save the device in collection
    this.save((err, object) => {
      if (err) return reject(err);
      // If everything goes well resolve and send device object
      resolve(object);
    });
  });
};

deviceSchema.statics.fetchWithDeviceId = function (deviceId) {
  const device = this;
  return new Promise((resolve, reject) => {
    if (!deviceId) return reject({ error: 'device id must be provided.' });

    device.findById(deviceId, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

deviceSchema.statics.fetchWithMacAddress = function (mac) {
  const device = this;
  // assert(this === )
  return new Promise((resolve, reject) => {
    if (!mac || !validator.isMACAddress(mac)) return reject({ error: 'something is wrong with mac address provided.' });

    device.findOne({ mac_address: mac }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

deviceSchema.statics.fetchAllMappedToUserId = function (userId) {
  const device = this;
  // assert(this === )
  return new Promise((resolve, reject) => {
    if (!userId) return reject({ error: 'user id is not provided.' });

    device.find({ user: userId }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

deviceSchema.statics.updateStatus = function (deviceId, status1) {

  return new Promise((resolve, reject) => {
    if (!deviceId) return reject({ error: 'device id is not provided.' });
    if (!status1) return reject({ error: 'status is not provided.' });
   
    this.findOneAndUpdate({ device: deviceId }, { status: status1 }, { new: true }, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = mongoose.model(collectionName, deviceSchema);

