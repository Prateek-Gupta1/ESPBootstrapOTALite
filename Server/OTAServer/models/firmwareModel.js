

const mongoose 		= require('mongoose');
const validator 		= require('validator');
const autoIncrement 	= require('mongoose-auto-increment');

const collectionName = 'Firmwares';

const TAG = 'firmwareModel';

autoIncrement.initialize(mongoose.connection);

const firmwareSchema = new mongoose.Schema({
  // _id : mongoose.Schema.Types.ObjectId,
  version_code: {
    type: Number,
  },
  version_name: {
    type: String,
    required: true,
    validate: {
      isAsync: true,
     		validator: (v, cb) => {
				 // console.log('Checking regex match : ' + validator.matches(v, /^\d{1,2}\.\d{1,2}\.\d{1,2}$/))
        cb(validator.matches(v, /^\d{1,2}\.\d{1,2}\.\d{1,2}$/));
      },
      messsage: '{VALUE} is incorrect pattern of version name. Should be of type 1.1.3 or 10.3.45',
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
  },
  firmware_image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'firmwareImages',
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
    if (!values) return reject({ error: 'values object provided is Null' });

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
  const firmware = this;
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

// module.exports.Archive = mongoose.model('ArchivedFirmware', firmwareSchema);


// var db = require('../db').get();
// var seq = require('../helpers/sequencer');
// module.exports.storeInfo = function(fmwInfo, deviceID, onComplete){

// 	try{

// 		var fmw = {
// 			fmw_id 			: !fmwInfo.fmwId ? seq.getNextSequence(collection, null, fmw_id) : fmwInfo.fmwId,
// 			fmw_version		: fmwInfo.fmwId ? seq.getNextSequence(collection, fmw_id, fmw_version) : 1,
// 			fmw_name		: fmwInfo.name,
// 			date_publised	: new Date(),
// 			description		: fmwInfo.desc,
// 			device_id		: deviceID
// 		};

// 		db.collection(collection).insertOne(fmw, onComplete);

// 	}catch (err){
// 		console.log(TAG + " " + err);
// 	}
// }

// module.exports.getLatestForDeviceId = function(deviceID, onComplete){

// 	if(deviceID){
// 		try{
// 			var result = db.collection(collection)
// 						   .find({ device_id : deviceID}, { _id : 0 })
// 						   .sort( {fmw_version : -1} )
// 						   .limit(1)
// 						   .toArray(onComplete);

// 		}catch(err){
// 			console.log(TAG + ' ' + err);
// 		}
// 	} else {
// 		onComplete("Could not fetch firmwares. Error : Input null", null)
// 	}
// }

// module.exports.listAllForDeviceId = function(deviceID, onComplete){

// 	if(deviceID){

// 		try{

// 			db.collection(collection)
// 			  .find({ device_id : deviceID}, { _id : 0 })
// 			  .toArray(onComplete);

// 		}catch(err){

// 			console.log(TAG + ' ' + err);
// 		}
// 	} else {
// 		onComplete("Could not fetch firmwares. Error : Input null", null);
// 	}
// }

