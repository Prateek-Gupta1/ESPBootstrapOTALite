
const mongoose = require('mongoose');
const validator = require('validator');
const autoIncrement = require('mongoose-auto-increment');

const collectionName = 'Firmwares';

const TAG = 'firmwareModel';

autoIncrement.initialize(mongoose.connection);

const firmwareSchema = new mongoose.Schema({
  version_code: {
    type: Number,
  },
  version_name: {
    type: String,
    required: true,
    validate: {
      isAsync: true,
     		validator: (v, cb) => {
        cb(validator.matches(v, /^\d{1,2}\.\d{1,2}\.\d{1,2}$/));
      },
      messsage: 'Incorrect pattern of version name. Should be of type 1.1.3 or 10.3.45',
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
  },
  publishedOn: {
    type: Date,
    default: Date.now,
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'devices',
    required: true,
  },
  firmware_image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'firmwareImages',
    require: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    index: true,
    default: 'Active',
  },
});

firmwareSchema.methods.publish = function () {
  return new Promise((resolve, reject) => {
    // try to save the firmware info in collection
    this.save((err, result) => {
      if (err) return reject(err);

      // If everything goes well resolve and send firmware object
      console.log(`${TAG} ${result}`);
      resolve(result);
    });
  });
};

firmwareSchema.statics.getAllForDevice = function (deviceId) {
  return new Promise((resolve, reject) => {
    if (!deviceId) return reject({ error: 'device id provided is Null' });

    this.find({ device: deviceId }, (err, result) => {
      if (err) return reject(err);

      console.log(`${TAG} ${result}`);
      resolve(result);
    });
  });
};


firmwareSchema.methods.updateInfo = function (values) {
  const firmware = this;
  // assert(this === )
  return new Promise((resolve, reject) => {
    if (!values) return reject({ error: 'No values were provided' });

    firmware.findOneAndUpdate(
      { _id: firmware._id },
      values,
      { new: true, runValidators: true },
      (err, result) => {
        if (err) return reject(err);
        console.log(`${TAG} ${result}`);
        resolve(result);
      },
    );
  });
};

firmwareSchema.statics.changeActiveFirmwareToInactiveForDevice = function (deviceId) {
  return new Promise((resolve, reject) => {
    this.findOneAndUpdate({ device: deviceId, status: 'Active' }, { status: 'Inactive' }, { new: true }, (err, result) => {
      if (err) {
        console, log(`${TAG} ${err}`);
        reject(err);
      }
      resolve(result);
    });
  });
};

firmwareSchema.statics.getActiveFirmware = function (deviceId) {
  //const firmware = this;
  // assert(this === )
  return new Promise((resolve, reject) => {
    if (!deviceId) return reject({ error: 'device id provided is Null' });

    this.find({ device: deviceId, status: 'Active' }, (err, result) => {
      if (err) return reject(err);

      console.log(`${TAG} ${result}`);
      resolve(result);
    });
  });
};

firmwareSchema.plugin(autoIncrement.plugin, { model: collectionName, field: 'version_code' });

module.exports = mongoose.model(collectionName, firmwareSchema);