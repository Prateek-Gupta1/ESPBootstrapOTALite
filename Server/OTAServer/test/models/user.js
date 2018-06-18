'use strict'

const chai = require('chai');
const expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');

var mongoose = require('mongoose');
var User = require('../../models/userModel');

chai.should();

chai.use(chaiAsPromised);

process.on("unhandledRejection", (reason) => {
	console.log("unhandled rejection: ", reason);
	unhandledRejectionExitCode = 1;
	throw reason;
});

describe('Unit tests of User Model', function(){

    describe('Name field validations', function(){
        it('should be invalid if name is empty', function(done){
            var user = new User({});
            user.validate(function(err){
                expect(err.errors.name).to.exist;
                done();
            });
        });

        it('should be invalid if name is null', function(done){
            var user = new User({name: null});
            user.validate(function(err){
                expect(err.errors.name).to.exist;
                done();
            });
        });

        it('should be valid if name exists', function(done){
            var user = new User({name: 'prateek'});
            user.validate(function(err){
                expect(err.errors.name).to.not.exist;
                done();
            });
        });

        it('should not allow name with more than 150 characters', function(done){
            var name = "";
            for( var i = 0; i < 151; i++){
                name = name + '1';
            }
            var user = new User({name: name});
            user.validate(function(err){
                expect(err.errors.name).to.exist;
                done();
            });
        });

        it('should allow name with exactly 150 characters', function(done){
            var name = "";
            for( var i = 0; i < 150; i++){
                name = name + '1';
            }
            var user = new User({name: name});
            user.validate(function(err){
                expect(err.errors.name).to.not.exist;
                done();
            });
        });
    });

    describe('Email field validations (Beware of Gmail)', function(){
        it('should be invalid if email is empty', function(done){
            var user = new User({});
            user.validate(function(err){
                expect(err.errors.email).to.exist;
                done();
            });
        });

        it('should be invalid if email is null', function(done){
            var user = new User({email: null});
            user.validate(function(err){
                expect(err.errors.email).to.exist;
                done();
            });
        });

        it('should allow email with pattern abcdefre@email.com', function(done){
            var user = new User({email: "abcdefg@email.com"});
            user.validate(function(err){
                expect(err.errors.email).to.not.exist;
                done();
            });
        });

        it('should not allow email with arbitrary pattern', function(done){
            var user = new User({email: "hello.edu@@mail"});
            user.validate(function(err){
                expect(err.errors.email).to.exist;
                done();
            });
        });

        it('should allow google email having length of string, before @, of length atleast 6 (e.g. 123456@gmail.com is allowed)', function(done){
            var user = new User({email: "123456@gmail.com"});
            user.validate(function(err){
                expect(err.errors.email).to.not.exist;
                done();
            });
        });

        it('should not allow google email having length of string before @ less than 6 (e.g. 12345@gmail.com is not allowed)', function(done){
            var user = new User({email: "12345@gmail.com"});
            user.validate(function(err){
                expect(err.errors.email).to.exist;
                done();
            });
        });
    });

    describe('Phone field validations', function(){
        it('should be invalid if phone is empty', function(done){
            var user = new User({});
            user.validate(function(err){
                expect(err.errors.phone).to.exist;
                done();
            });
        });

        it('should be invalid if phone is null', function(done){
            var user = new User({phone: null});
            user.validate(function(err){
                expect(err.errors.phone).to.exist;
                done();
            });
        });

        it('should allow valid phone number like 4154567890', function(done){
            var user = new User({phone: "4154567890"});
            user.validate(function(err){
                expect(err.errors.phone).to.not.exist;
                done();
            });
        });
    });

    describe('Password field validations', function(){
        it('should be invalid if password is empty', function(done){
            var user = new User({});
            user.validate(function(err){
                expect(err.errors.password).to.exist;
                done();
            });
        });

        it('should be invalid if password is null', function(done){
            var user = new User({password: null});
            user.validate(function(err){
                expect(err.errors.password).to.exist;
                done();
            });
        });

        it('should be valid if password exists', function(done){
            var user = new User({password: "qwew76122"});
            user.validate(function(err){
                expect(err.errors.password).to.not.exist;
                done();
            });
        });
    });

    describe('Testing Model methods', function(){
        var User = require('../../models/userModel');

        before(function(done){
            mongoose.connect('mongodb://localhost:27017/firmwareDB_test');
            done();
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
            it('should register a user with valid details', async function(){
                let userInfo = {
                    name: 'test',
                    email: 'testuser@gmail.com',
                    phone: '4156123456',
                    password: 'qwerty' 
                }
    
                let user = new User(userInfo);
                let result = await user.register();
                expect(result._id).to.exist;
            });

            it('should not register a user with invalid details', async function(){
                let userInfo = {
                    name: 'test',
                    email: 'testusermailmail.com',
                    phone: '4156133456',
                    password: 'qwertyui12' 
                }
                let user = new User(userInfo);
                try{
                    await user.register();
                }catch(err){
                    expect(err).to.exist;
                }
            });

            it('should hash the password before registering', async function(){
                let userInfo = {
                    name: 'test',
                    email: 'testusermail1@gmail.com',
                    phone: '4156131456',
                    password: 'qwertyui1112' 
                }
    
                let user = new User(userInfo);
                let result = await user.register();
                expect(result.password).to.not.equal(userInfo.password);
            });

            it('should not register user with an already existing email id in mongodb collection',async function(){
                let userInfo = {
                    name: 'test',
                    email: 'testuser@gmail.com',
                    phone: '4156123456',
                    password: 'qwertyui12' 
                }
    
                let user = new User(userInfo);
                try{
                    await user.register();
                }catch(err){
                    expect(err).to.exist;
                }
            });

            it('should have \'Role\' field set', async function(){
                let userInfo = {
                    name: 'test',
                    email: 'testuser12@gmail.com',
                    phone: '4156123406',
                    password: 'qwertyui12' 
                }
    
                let user = new User(userInfo);
                let result = await user.register();
                expect(result.role).to.exist.and.equal('dev');
            });

            it('should have createdOn field set', async function(){
                let userInfo = {
                    name: 'test',
                    email: 'testuser123@gmail.com',
                    phone: '4156123402',
                    password: 'qwertyui12' 
                }
    
                let user = new User(userInfo);
                let result = await user.register();
                expect(result.createdOn).to.exist;
            });
        });

        describe('authenticate', function(){
            it('should resolve if correct credentials are provided', async function(){
                const email = 'testuser@gmail.com';
                const password = 'qwerty';

                let result = await User.authenticate(email, password);
                expect(result).to.exist;
            });

            it('should not resolve if incorrect password is provided', async function(){
                const email = 'testuser@gmail.com';
                const password = 'qwerty123';
                try{
                    await User.authenticate(email, password);
                }catch(err){
                    expect(err.error).to.exist.and.equal('Password did not match');
                }
            });

            it('should not resolve if incorrect email is provided', async function(){
                const email = 'testus@gmail.com';
                const password = 'qwerty123';
                try{
                   await User.authenticate(email, password);
                }catch(err){
                    expect(err.error).to.exist.and.equal('User not found');
                }
            });
        });
        
    });
});