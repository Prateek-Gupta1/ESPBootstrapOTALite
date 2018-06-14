'use strict'

var mongoose 	= require('mongoose');
var validator 	= require('validator');
//var db = require('../db').get();

var collectionName = 'Devices';

const TAG = 'deviceModel';

let deviceSchema = new mongoose.Schema({
	mac_address : {
		type : String,
		unique : true,
		required : true,
		validate : {
			validator : function(mac_address){
				return validator.isMACAddress(mac_address);
			},
			message : 'Invalid macaddress'
		}
	},
	name : {
		type : String,
		required : true,
		lowercase : true,
		maxlength : 40,
		trim : true
	},
	description : {
		type : String,
		maxlength : 200,
	},
	model : {
		type : String,
		maxlength : 40,
		required : false,
		trim : true
	},
	registeredOn : {
		type : Date,
		default : Date.now
	},
	status : {
		type : String,
		enum : ['Active', 'Sleep', 'Dead', 'Updatable'],
		default : 'Active'
	},
	user : {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'users'
	}
});

deviceSchema.methods.register = function(){
	//Return promise
	return new Promise((resolve, reject) => {
		//if(!device) return reject({error : 'Invalid device object'});
		
		//try to save the device in collection
		this.save(function(err, object){
			if(err) return reject(err);

			//If everything goes well resolve and send device object
			console.log(TAG + ' ' + object);
			resolve(object);
		});
	});
}

deviceSchema.statics.fetchWithDeviceId = function(deviceId){

	const device = this;
	return new Promise((resolve, reject) => {

		if(!deviceId) return reject({error : 'device id provided is Null'});

		device.findById(deviceId,function(err, result){
			if(err) return reject(err);

			console.log(TAG + " " + result);
			resolve(result);
		});
	});
}

deviceSchema.statics.fetchWithMacAddress = function(mac){

	const device = this;
	//assert(this === )
	return new Promise((resolve, reject) => {

		if(!mac) return reject({error : 'mac address provided is Null'});

		device.findOne({mac_address : mac},function(err, result){
			if(err) return reject(err);

			console.log(TAG + " " + result);
			resolve(result);
		});
	});
}

deviceSchema.statics.fetchAllMappedToUserId = function(userId){
	const device = this;
	//assert(this === )
	return new Promise((resolve, reject) => {

		if(!userId) return reject({error : 'user id provided is Null'});

		device.find({user : userId},function(err, result){
			if(err) return reject(err);

			console.log(TAG + " " + result);
			resolve(result);
		});
	});
}

deviceSchema.statics.updateStatus = function(deviceId, s){
	return new Promise((resolve, reject) => {

		this.findOneAndUpdate({ device : deviceId}, { status : s }, { new : true }, function(err, result){
			if(err){
				console,log(TAG + ' ' + err); 
				reject(err)
			};
			resolve(result);
		});
	});
}

module.exports = mongoose.model(collectionName, deviceSchema);

