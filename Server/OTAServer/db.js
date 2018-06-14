'use strict'

var MongoClient = require('mongodb').MongoClient;

var state = { db : null};

exports.connect = function(url, callback){
	
	if(state.db) return db;

	if(typeof url === 'string'){
		MongoClient.connect(url, function(err, db) {
    		if (err) return callback(err);
    		state.db = db;
    		callback();
  		});
	} else {
		throw "MongoDb URL not a string";
	}
}

exports.get = function() {
  return state.db
}

exports.close = function(callback) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      callback(err)
    })
  }
}