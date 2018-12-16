'use strict'

const express = require('express');
const router = express.Router();
const UserManager = require('../services/user');
const DeviceManager = require('../services/device');

let tokenMap = new Map();

router.post('/register/user',(req, res) => {
   const manager = new UserManager();
   const user = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    };

    manager.register(user)
      .then(() => {
         res.render('index', {code: '200', message: 'Success'});
      }).catch((err) => {
         console.log(err);
         res.render('index', {code: '504', message: err});
      });
});

router.get('/register',(req, res) => {
   res.render('register');
});

router.post('/login', (req, res) => {
   console.log('Reached Login');
   const usrManager = new UserManager();
   usrManager.login(req.body.email, req.body.password)
    .then((user) => {
      if(user) { 
         //console.log(user);
         tokenMap.set(String(user._id), user);
         let dvcManager = new DeviceManager();

         dvcManager.listAllDevicesforUser(user._id)
         .then((devicelist) => {
            //console.log('devicelist: ' + devicelist);
            res.render('device', {data: {code: '200', info: user,  devices: devicelist}}); 
         });
      } else { 
         res.render('index', { code: '401', message: 'Invalid credentials.' }); 
      }
    }).catch((err) => {
      // Check if it is validation error
      console.log(err);
      if (err.name === 'ValidationError') {
         res.render('index', { code: '401', message: 'Invalid credentials.' });
      }else{
         res.render('index', { code: '504', message: err });
      }
    });
})

router.post('/register/device', (req, res) => {
   console.log("Reached device registration");
   //console.log(req.body.userId);
   //console.log(tokenMap.has(req.body.userId));
   if(!tokenMap.has(String(req.body.userId))){
      res.render('index', { code: '401', message: 'Unauthorized access' });
      return;
   }

   let dvcManager = new DeviceManager();
   const device = {
      mac_address: req.body.mac_address,
      name: req.body.name,
      userId: req.body.userId,
      description: req.body.description,
      modelName: req.body.modelName,
    };

   dvcManager.register(device)
   .then((result) => {
      dvcManager.listAllDevicesforUser(device.userId)
      .then((devicelist) => {
         console.log('devicelist: ' + devicelist);
         res.render('device', {data: {code: '200', info: tokenMap.get(String(device.userId)),  devices: devicelist}}); 
      });
   }).catch((err) => {
      console.log(err);
      dvcManager.listAllDevicesforUser(user._id)
      .then((devicelist) => {
         res.render('device', {data: {code: '200', info: tokenMap.get(String(device.userId)),  devices: devicelist}}); 
      });
   });
});

router.post('/logout', (req, res) => {
   tokenMap.delete(String(req.body.userid));
   res.render('index', { code: '200', message: 'Logout successful.' });
});

module.exports = router;