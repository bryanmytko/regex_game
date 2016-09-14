const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = process.env.MONGO_URL || 'mongodb://localhost:27017/regex-game';

const state = {
  db: null
};

exports.connect = function(done){
  if(state.db) return done();

  MongoClient.connect(url, function(err, db) {
    if(err) return done(err);
    state.db = db;
    done();
  });
};

exports.get = function(){
  return state.db;
};

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    });
  }
}
