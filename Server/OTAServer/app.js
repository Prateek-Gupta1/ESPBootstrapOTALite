'use strict'

const createError = require('http-errors');
const express = require('express');
const path = require('path');
//const cookieParser  = require('cookie-parser');
const logger = require('morgan');
const colors = require('colors');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const config = require('./config/config');
const bodyParser = require('body-parser');

const usersRouter = require('./controllers/users');
const firmwareRouter = require('./controllers/firmware');
const deviceRouter = require('./controllers/device');
//const userAuth = require('./middlewares/authentication/userauth');

const app = express();

console.log(colors.yellow(path.join(__dirname, 'views')));
// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.disable('x-powered-by');
//app.use(bodyParser.json());

// Configure API routes
app.use('/api/user', usersRouter);
app.use('/api/firmware', firmwareRouter);
app.use('/api/device', deviceRouter);

// Redirect all other routes to index.html
app.use('*', function(req, res){
  res.render('index');
});

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log(colors.red(err));
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Handle any uncaught exeption
app.on('uncaughtException', (err) => {
  console.log(colors.red(err.stack));
  process.exit(2);
});

// Catch any uncaught rejection from a Promise.
app.on('unhandledRejection', (reason, p) => {
  console.log(colors.red(' Unhandled rejection at : Promise ' + p + 'reason : ' + reason));
});

// Database connection string.
let dbConnectionStr = `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`;

// Connect to mongodb.
mongoose.connect(dbConnectionStr) //{ useNewUrlParser: true })
.then( () => { 
  autoIncrement.initialize(mongoose.connection);
  console.log(colors.green('Connected to mongodb database'));
})
.catch(err => {
  console.log(colors.red('Connection to mongodb failed'));
  console.log(err);
  process.exit(2);
});

// Listen to disconnect event and shutdown system.
mongoose.connection.on('disconnected', function(){
  console.log(colors.red('Mongoose default connection is disconnected'));
  process.exit(2);
});

// Close mongodb connection when process is terminated.
process.on('exit', function(){
  mongoose.connection.close(function(){
    console.log(colors.red('Mongoose default connection is closed due to application termination'));
  });
});

module.exports = app;
