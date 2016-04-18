require('dotenv').config();

var express = require('express');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var app = express();
var db = require('./db');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine('mustache', mustacheExpress());

app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
  res.render('index');
});

app.post('/leaderboard', function(req, res){
  var collection = db.get().collection('scorecollection');
  collection.insert([{  name: req.body.name, time: req.body.time }])

  collection.find().limit(10).sort({ time: 1 }).toArray(function(err, high_scores) {
    res.send(JSON.stringify(high_scores));
  })
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

