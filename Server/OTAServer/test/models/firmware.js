'use strict'

const chai = require('chai');
const expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');

var mongoose = require('mongoose');
var Firmware = require('../../models/firmwareModel');
const autoIncrement = require('mongoose-auto-increment');


process.on("unhandledRejection", (reason) => {
	console.log("unhandled rejection: ", reason);
	unhandledRejectionExitCode = 1;
	throw reason;
});

describe('Unit tests for Firmware model', function(){

    describe('Testing Data validations', function(){

        describe('Version Name field validations', function(){

            it('should not pass if version name is empty', function(done){
                var fmw = new Firmware({});
                fmw.validate(function(err){
                    expect(err.errors.version_name).to.exist;
                    done();
                });
            });
    
            it('should not pass if version name is null', function(done){
                var fmw = new Firmware({version_name: null});
                fmw.validate(function(err){
                    expect(err.errors.version_name).to.exist;
                    done();
                });
            });
    
            it('should pass if a valid version name exists', function(done){
                var fmw = new Firmware({version_name: '1.2.4'});
                fmw.validate(function(err){
                    expect(err.errors.version_name).to.not.exist;
                    done();
                });
            });
    
            it('should not pass if an invalid version name', function(done){
                var fmw = new Firmware({version_name: '123.43'});
                fmw.validate(function(err){
                    expect(err.errors.version_name).to.exist;
                    done();
                });
            });
    
        });

        describe('Name field validation', function(){

            it('should not pass if name is empty', function(done){
                var fmw = new Firmware({});
                fmw.validate(function(err){
                    expect(err.errors.name).to.exist;
                    done();
                });
            });
    
            it('should not pass if name is null', function(done){
                var fmw = new Firmware({name: null});
                fmw.validate(function(err){
                    expect(err.errors.name).to.exist;
                    done();
                });
            });
    
            it('should pass if name exists', function(done){
                var fmw = new Firmware({name: 'qwiqw'});
                fmw.validate(function(err){
                    expect(err.errors.name).to.not.exist;
                    done();
                });
            });
    
            it('should not pass if name has more than 40 characters', function(done){
                var name = "";
                for( var i = 0; i < 41; i++){
                    name = name + '1';
                }
                var fmw = new Firmware({name: name});
                fmw.validate(function(err){
                    expect(err.errors.name).to.exist;
                    done();
                });
            });
    
            it('should pass if name have exactly 40 characters', function(done){
                var name = "";
                for( var i = 0; i < 40; i++){
                    name = name + '1';
                }
                var fmw = new Firmware({name: name});
                fmw.validate(function(err){
                    expect(err.errors.name).to.not.exist;
                    done();
                });
            });
        });

        describe('Description field validations', function(){

            it('should pass if description is not provided', function(done){
                var fmw = new Firmware({});
                fmw.validate(function(err){
                    expect(err.errors.description).to.not.exist;
                    done();
                });
            });
    
            it('should not pass if description has length more than 200 characters', function(done){
                var desc = "";
                for( var i = 0; i < 210; i++){
                    desc = desc + '1';
                }
                var fmw = new Firmware({description: desc});
                fmw.validate(function(err){
                    expect(err.errors.description).to.exist;
                    done();
                });
            });
    
            it('should pass if description has length <= 200 characters', function(done){
                var desc = "";
                for( var i = 0; i < 200; i++){
                    desc = desc + '1';
                }
                var fmw = new Firmware({description: desc});
                fmw.validate(function(err){
                    expect(err.errors.description).to.not.exist;
                    done();
                });
            });
        });
    });

    describe('Testing model methods', function(){

        var Device = require('../../models/deviceModel');
        var User = require('../../models/userModel');
        var deviceId;

        before(function(done){  
            mongoose.connect('mongodb://localhost:27017/firmwareDB_test')
            .then(() => {
                autoIncrement.initialize(mongoose.connection);

                var user = new User({
                    name: 'dummy',
                    email: 'dummyforfirmware@email.com',
                    phone: '7862340980',
                    password: 'qwewrt',
                });

                user.register().then(result => {
                    var userId = result._id;
                    var device = new Device({
                        mac_address: '19:13:14:10:12:00',
                        name: 'test',
                        user: userId
                    });
                    device.register().then(result => {
                        deviceId = result._id;
                        done();
                    }).catch(err => {
                        console.log(err);
                    });
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

        describe('publish', function(){
            
            it('should register a valid firmware info', async function(){
                var fmwInfo = {
                    version_name: '1.2.3',
                    name: 'TestFirmware',
                    device: deviceId,
                    firmware_image: deviceId
                }

                let fmw = new Firmware(fmwInfo);
                let res = await fmw.publish();
                expect(res._id).to.exist;
            });


        });

        describe('getAllForDevice', function(){

        });

        describe('updateInfo', function(){

        });

        describe('changeActiveFirmwareToInactiveForDevice', function(){

        });

        describe('getActiveFirmware', function(){

        });
    });
})