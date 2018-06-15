

const mongoose = require('mongoose');

const TAG = 'FirmwareImagesModel';

const collectionName = 'FirmwareImages';

const firmwareImageSchema = new mongoose.Schema({
  // _id : mongoose.Schema.Types.ObjectId,
  image_file: {
    type: Buffer,
    required: true,
  },
});

firmwareImageSchema.methods.storeImage = function () {
  return new Promise((resolve, reject) => {
    this.save((err, object) => {
      if (err) return reject(err);
      resolve({ id: object._id });
    });
  });
};

firmwareImageSchema.statics.retrieveImage = function (id) {
  return new Promise((resolve, reject) => {
    this.findOne({ _id: id }, { _id: 0 }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// firmwareImageSchema.statics.removeImage = function(){
//     return new Promise((resolve, reject) => {

//     });
// };

module.exports = mongoose.model(collectionName, firmwareImageSchema);
