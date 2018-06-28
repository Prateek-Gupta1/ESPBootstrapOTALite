
const mongoose = require('mongoose');
const validator = require('validator');
const config = require('../config/config');
const bcrypt = require('bcrypt');

const collectionName = 'Users';
const TAG = 'userModel';

const SALT_WORK_FACTOR = config.salt_work_factor;


const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: 150,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true,
    validate: {
      isAsync: true,
      validator: (v, cb) => {
        cb(validator.isEmail(v));
      },
      message: 'Not a valid email',
    },
  },
  phone: {
    type: String,
    maxlength: 13,
    minlength: 9,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['dev', 'admin', 'client'],
    default: 'dev',
  },
  createdOn: {
    type: Date,
    default: Date.now,
  },
});

// Assigning hook method to hash the password before User is saved
userSchema.pre('save', function (next) {
  const user = this;

  // only hash the password if it has been modified or is new
  if (!user.isModified('password')) return next();

  // Add salt to password
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);

    // hash the password along with new salt
    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err);

      // override the client password with the hash
      user.password = hash;
      next();
    });
  });
});

const comparePassword = (candidatePassword, hash, onComparisonComplete) => {
  //console.log(hash);
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) return onComparisonComplete(err, null);
    onComparisonComplete(null, isMatch);
  });
};

userSchema.methods.register = function () {
  // Return promise
  return new Promise((resolve, reject) => {
    // if(!user) return reject({error : 'Invalid user object'});

    // try to save the user in collection
    this.save((err, object) => {
      if (err) return reject(err);

      // If everything goes well resolve and send user object
      //console.log(`${TAG} ${object}`);
      resolve(object);
    });
  });
};

userSchema.statics.authenticate = function (emailID, password) {
  // Return promise
  return new Promise((resolve, reject) => {
    // Find the user with email = emailID
    this.findOne({ email: emailID }, {
      _id: 1, name: 1, role: 1, phone: 1, password: 1, email: 1,
    }, (err, user) => {
      if (err || !user) return reject(err || { error: 'User not found' });
      // Hash the provided password and compare with the one stored in db
      comparePassword(password, user.password, (err, isMatch) => {
        if (err) return reject(err);

        // Password matched.
        if (isMatch == true) return resolve(user);
        return reject({ error: 'Password did not match' });
      });
    });
  });
};

userSchema.statics.checkIfExists = function(userId){
  return new Promise((resolve, reject) => {

    this.findOne({ _id : userId }, { name: 1 }, (err, user) => {
      if(err || !user) {
        return reject(err || {error: 'User not found.' });
      }
      return resolve(user);
    });
  });
};

module.exports = mongoose.model(collectionName, userSchema);
