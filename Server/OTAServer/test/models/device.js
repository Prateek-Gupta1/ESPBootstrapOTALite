'use strict'

const chai = require('chai');
const expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');

var mongoose = require('mongoose');
var Device = require('../../models/deviceModel');

chai.should();

chai.use(chaiAsPromised);

process.on("unhandledRejection", (reason) => {
	console.log("unhandled rejection: ", reason);
	unhandledRejectionExitCode = 1;
	throw reason;
});

describe('Unit tests of Device Model', function(){

    describe('Mac Address validations', function(){
        it('should not pass if mac address is empty', function(done){
            var device = new Device({});
            device.validate(function(err){
                expect(err).to.exist;
                done();
            });
        });

        it('should not pass if invalid mac address is given', function(done){
            var device = new Device({mac_address: '12312'});
            device.validate(function(err){
                expect(err.errors.mac_address).to.exist;
                done();
            });
        });

        it('should pass if a valid mac address is set', function(done){
            var device = new Device({mac_address: '12:13:14:15:12:78'});
            device.validate(function(err){
                expect(err.errors.mac_address).to.not.exist;
                done();
            });
        });
    });


    describe('Name field validations', function(){
        it('should be invalid if name is empty', function(done){
            var device = new Device({});
            device.validate(function(err){
                expect(err.errors.name).to.exist;
                done();
            });
        });

        it('should be invalid if name is null', function(done){
            var device = new Device({});
            device.validate(function(err){
                expect(err.errors.name).to.exist;
                done();
            });
        });

        it('should be valid if name exists', function(done){
            var device = new Device({name: 'Humidity'});
            device.validate(function(err){
                expect(err.errors.name).to.not.exist;
                done();
            });
        });

        it('should not allow name with more than 40 characters', function(done){
            var name = "";
            for( var i = 0; i < 41; i++){
                name = name + '1';
            }
            var device = new Device({name: name});
            device.validate(function(err){
                expect(err.errors.name).to.exist;
                done();
            });
        });

        it('should allow name with exactly 40 characters', function(done){
            var name = "";
            for( var i = 0; i < 40; i++){
                name = name + '1';
            }
            var device = new Device({name: name});
            device.validate(function(err){
                expect(err.errors.name).to.not.exist;
                done();
            });
        });
    });

    describe('Description field validations', function(){
        it('should pass if description is not provided', function(done){
            var device = new Device({});
            device.validate(function(err){
                expect(err.errors.description).to.not.exist;
                done();
            });
        });

        it('should not pass if description has length more than 200 characters', function(done){
            var desc = "";
            for( var i = 0; i < 210; i++){
                desc = desc + '1';
            }
            var device = new Device({description: desc});
            device.validate(function(err){
                expect(err.errors.description).to.exist;
                done();
            });
        });

        it('should pass if description has length <= 200 characters', function(done){
            var desc = "";
            for( var i = 0; i < 200; i++){
                desc = desc + '1';
            }
            var device = new Device({description: desc});
            device.validate(function(err){
                expect(err.errors.description).to.not.exist;
                done();
            });
        });
    });

    describe('Model/Make field validations', function(){
        it('should pass if model is not provided', function(done){
            var device = new Device({});
            device.validate(function(err){
                expect(err.errors.model).to.not.exist;
                done();
            });
        });

        it('should not pass if model has length more than 40 characters', function(done){
            var desc = "";
            for( var i = 0; i < 50; i++){
                desc = desc + '1';
            }
            var device = new Device({model: desc});
            device.validate(function(err){
                expect(err.errors.model).to.exist;
                done();
            });
        });

        it('should pass if description has length <= 200 characters', function(done){
            var desc = "";
            for( var i = 0; i < 40; i++){
                desc = desc + '1';
            }
            var device = new Device({model: desc});
            device.validate(function(err){
                expect(err.errors.model).to.not.exist;
                done();
            });
        });
    });

    describe('Testing Model methods', function(){
        var Device = require('../../models/deviceModel');
        var User = require('../../models/userModel');
        var userId;

        before(function(done){  
            mongoose.connect('mongodb://localhost:27017/firmwareDB_test')
            .then(() => {
                var user = new User({
                    name: 'dummy',
                    email: 'dummyfordevice@email.com',
                    phone: '7862341980',
                    password: 'qwewrt',
                });

                user.register().then(result => {
                    userId = result._id;
                    done();
                }).catch(err => {
                    console.log(err);
                });
            });
        });

        after(function(done){
            mongoose.connection.db.dropDatabase().then(() => {
                mongoose.connection.close(function(){
                    done();
                });
            }).catch(err => {
                console.log(err);
            });
           
        });

        describe('register', function(){

            it('should register a device with valid details', async function(){
                let deviceInfo = {
                    mac_address: '12:13:14:15:12:78',
                    name: 'test',
                    user: userId
                }

                let device = new Device(deviceInfo);
                let result = await device.register();
                expect(result._id).to.exist;
            });

            it('should not register a device with invalid details', async function(){
                let deviceInfo = {
                    mac_address: '12334',
                    name: 'test',
                    user: userId
                }
                let device = new Device(deviceInfo);
                try{
                    await device.register();
                }catch(err){
                    expect(err).to.exist;
                }
            });

            it('should not register a device with existing mac address', async function(){
                let deviceInfo = {
                    mac_address: '12:13:14:15:12:78',
                    name: 'test',
                    user: userId
                }
                let device = new Device(deviceInfo);
                try{
                    await device.register();
                }catch(err){
                    expect(err).to.exist;
                }
            });

            it('should have status field set', async function(){
                let deviceInfo = {
                    mac_address: '12:13:14:15:12:72',
                    name: 'test',
                    user: userId
                }

                let device = new Device(deviceInfo);
                let result = await device.register();
                expect(result.status).to.exist.and.equal('Active');
            });

            it('should not allow status field to have values other than [ Active, Sleep, Dead, Updatable]', async function(){
                let deviceInfo = {
                    mac_address: '12:11:14:15:12:72',
                    name: 'test',
                    user: userId,
                    status: 'Com'
                }

                let device = new Device(deviceInfo);
                try{
                    await device.register();
                }catch(err){
                    expect(err.errors.status).to.exist;
                }
            });

            it('should have registeredOn field set', async function(){
                let deviceInfo = {
                    mac_address: '12:13:14:15:11:72',
                    name: 'test',
                    user: userId
                }

                let device = new Device(deviceInfo);
                let result = await device.register();
                expect(result.registeredOn).to.exist;
            });
        });

        describe('fetchwithDeviceId', function(){

            let deviceId;
            before(function(done){
                let deviceInfo = {
                    mac_address: '12:13:14:10:12:00',
                    name: 'test',
                    user: userId
                }

                let device = new Device(deviceInfo);
                device.register()
                .then((r)=>{
                    deviceId = r._id;
                    done();
                })
                .catch((e)=>{});
            });

            it('should return result if device exists', async function(){
                let result = await Device.fetchWithDeviceId(deviceId);
                expect(result).to.exist;
            });

            it('should not return result if device does not exist', async function(){
                let result = await Device.fetchWithDeviceId('5b27031491d9e98094d14023');
                expect(result).to.not.exist;
            });

            it('should throw error if deviceID is not provided', async function(){
                try{
                    await Device.fetchWithDeviceId();
                }catch(err){
                    expect(err.error).to.exist.and.equal('device id must be provided.');
                }
            });
        });

        describe('fetchwithMacAddress', function(){
            const mac = '12:13:14:10:12:78';
           
            before(function(done){
                let deviceInfo = {
                    mac_address: mac,
                    name: 'test',
                    user: userId
                }

                let device = new Device(deviceInfo);
                device.register()
                .then((r)=>{
                    done();
                })
                .catch((e)=>{});
            });

            it('should return result if device with mac address exists', async function(){
                let result = await Device.fetchWithMacAddress(mac);
                expect(result).to.exist;
            });

            it('should not return result if device with mac address does not exist', async function(){
                let result = await Device.fetchWithMacAddress('10:13:14:10:12:78');
                expect(result).to.not.exist;
            });

            it('should throw error if mac address is not provided', async function(){
                try{
                    await Device.fetchWithMacAddress();
                }catch(err){
                    expect(err.error).to.exist.and.equal('something is wrong with mac address provided.');
                }
            });

            it('should throw error if invalid mac address is provided', async function(){
                try{
                    await Device.fetchWithMacAddress('12:232');
                }catch(err){
                    expect(err.error).to.exist.and.equal('something is wrong with mac address provided.');
                }
            });
        });

        describe('fetchAllMappedToUserId', function(){
           
            it('should return result if devices are mapped to user id', async function(){
                let result = await Device.fetchAllMappedToUserId(userId);
                expect(result).to.exist;
                expect(result.length).equal(5);
            });

            it('should not return result if device mapped to user id does not exist', async function(){
                let result = await Device.fetchAllMappedToUserId('5b27031491d9e98094d14023');
                expect(result.length).equal(0);
            });

            it('should throw error if mac address is not provided', async function(){
                try{
                    await Device.fetchAllMappedToUserId();
                }catch(err){
                    expect(err.error).to.exist.and.equal('user id is not provided.');
                }
            });
        });

        describe('updateStatus', function(){
            let deviceId;

            before(function(done){
                let deviceInfo = {
                    mac_address: '12:13:14:19:12:00',
                    name: 'test',
                    user: userId
                }

                let device = new Device(deviceInfo);
                device.register()
                .then((r)=>{
                    deviceId = r._id;
                    console.log(deviceId);
                    done();
                })
                .catch((e)=>{});
            });

            it('should be able to update status to one of [Active, Sleep, Dead, Updatable]', async function(){
                let doc = await Device.updateStatus(deviceId, 'Dead');
                console.log(doc);
                expect(doc.status).equal('Dead');
            });

            it('should not allow the status to be updated to a value other than [Active, Sleep, Dead, Updatable]', async function(){
                try{
                    await Device.updateStatus(deviceId, 'WhatTheFish');
                }catch(err){
                    expect(err).to.exist;
                }
            });

            it('should throw error if deviceId is not provided', async function(){
                try{
                    await Device.updateStatus(null,  'WhatTheFish');
                }catch(err){
                    expect(err.error).to.exist.and.equal('device id is not provided.');
                }
            });

            it('should throw error if status is not provided', async function(){
                try{
                    await Device.updateStatus(deviceId, null);
                }catch(err){
                    expect(err.error).to.exist.and.equal('status is not provided.');
                }
            });
        });
    });

});