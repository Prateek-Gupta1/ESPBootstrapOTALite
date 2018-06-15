

const express = require('express');

const router = express.Router();
const User = require('../models/userModel');
const UserValidation = require('../middlewares/validations/userValidation');

/**/
router.post('/register', UserValidation.validateUserRegistrationData, (req, res, next) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    password: req.body.password,
  });

  user.register()
    .then(() => {
      res.status(200).send('Registered successfully.');
    }).catch((err) => {
      // Check if it is validation error
      if (err.name === 'ValidationError') {
        res.status(400).send(err);
      }
      // Unknown error, so pass it on
      next(err);
    });

  return router;
});


router.post('/login', UserValidation.validateUserLoginData, (req, res, next) => {
  User.authenticate(req.body.email, req.body.password)
    .then((result) => {
      if (result) { res.status(200).send({ success: 'Login successful.' }); } else { res.status(401).send({ error: 'Invalid credentials.' }); }
    }).catch((err) => {
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
