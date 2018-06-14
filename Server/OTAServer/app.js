'use strict'

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser  = require('cookie-parser');
const logger = require('morgan');
const colors = require('colors');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const config = require('./config/config');
const bodyParser = require('body-parser');

const usersRouter = require('./controllers/users');
const firmwareRouter = require('./controllers/firmware');
const deviceRouter = require('./controllers/device');

const app = express();

console.log(colors.yellow(path.join(__dirname, 'views')));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

// Configure routes
app.use('/', usersRouter);
app.use('/user', usersRouter);
app.use('/firmware', firmwareRouter);
app.use('/device', deviceRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(colors.red(err));
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Handle any uncaught exeption
app.on('uncaughtException', (err) => {
  console.log(colors.red(err.stack));
  process.exit(2);
});

app.on('unhandledRejection', (reason, p) => {
  console.log(colors.red(' Unhandled rejection at : Promise ' + p + 'reason : ' + reason));
});

//Try to establish the database connection
let dbConnectionStr = `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`;

//Connect to mongodb path
mongoose.connect(dbConnectionStr)
.then( () => { 
  autoIncrement.initialize(mongoose.connection);
  console.log(colors.green('Connected to mongodb database'));
})
.catch(err => {
  console.log(colors.red('Connection to mongodb failed'));
  console.log(err);
  process.exit(2);
});

//Listen to disconnect event and shutdown system.
mongoose.connection.on('disconnected', function(){
  console.log(colors.red("Mongoose default connection is disconnected"));
  process.exit(2);
});

process.on('exit', function(){
  mongoose.connection.close(function(){
    console.log(colors.red('Mongoose default connection is disconnected due to application termination'));
    //process.exit(0)
  });
});
//Listen to process shutdown signal from user.
process.on('SIGINT', function(){
  mongoose.connection.close(function(){
      console.log(colors.red('Mongoose default connection is disconnected due to application termination'));
      //process.exit(0)
  });
});

module.exports = app;
