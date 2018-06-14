'use strict'

var express = require('express');
var router = express.Router();
const User = require('../models/userModel');
const UserValidation = require('../middlewares/validations/userValidation');

/**/
router.post('/register', UserValidation.validateUserRegistrationData, function(req, res, next) {

	let user = new User({
		name 		: req.body.name,
		email 		: req.body.email,
		phone		: req.body.phone,
		password	: req.body.password
	});

	user.register()
	.then(result => {
		res.status(200).send("Registered successfully.");
	}).catch(err => {
		//Check if it is validation error
		if(err.name === 'ValidationError'){
			res.status(400).send(err);
		}
		//Unknown error, so pass it on  
		next(err);
	});
	
	return router;
});


router.post('/login', UserValidation.validateUserLoginData, function(req, res, next){

	User.authenticate(req.body.email, req.body.password)
	.then(result => {
		if(result)
			res.status(200).send({success : 'Login successful.'});
		else
			res.status(401).send({error : 'Invalid credentials.'});
	}).catch(err => {
		//Check if it is validation error
		if(err.name === 'ValidationError'){
			res.status(400).send(err);
		}
		//Unknown error, so pass it on  
		next(err);
	});

	return router;
});

module.exports = router;


// User.register(user, function(err, result){
	// 	if(!err){
	// 		console.log(result);
	// 		res.status(200).send("Registered successfully.");
	// 	}else{
	// 		console.log(err);
	// 		res.status(500).send({ erro : "Internal server error"});
	// 	}
	// });

// User.authenticate(userCred, function(err, result){
	// 	if(!err){
	// 		if(result !== null)
	// 			res.status(200).send({success : 'Login successful.'});
	// 		else
	// 			res.status(401).send({ error : 'Invalid credentials.' });
	// 	}else{
	// 		console.log(err);
	// 		res.status(500).send({ error : 'Internal server error.' });
	// 	}
	// });