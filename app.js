require('dotenv').config();

var express = require('express');
var mustacheExpress = require('mustache-express');
var app = express();
var db = require('./db');

app.use(express.static('public'));
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
  var collection = db.get().collection('scorecollection');
  high_scores = collection.find().limit(2);

  // @TODO Make data available to view
  // @TODO Add post method for inserting high scores
  console.log(typeof(high_scores));

  res.render('index');
});

db.connect(function(err){
  if(err){
    console.log('Unable to connect to database.');
    process.exit(1);
  } else {
    app.listen(5000, function () {
      console.log('Listening on port 5000!');
    });
  }
});

