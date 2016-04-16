var require('dotenv').config();

var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mustacheExpress = require('mustache-express');
var app = express();

app.use(express.static('public'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
  res.render('index');
});

app.listen(5000, function () {
    console.log('Listening on port 5000!');
});

/* Test Mongodb */
var url = 'mongodb://' + process.env.DB_HOST + ':' + process.env.DB_PORT + '/' + process.env.DB_NAME;
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected correctly to server.");
  db.close();
});
