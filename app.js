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

app.get('/leaderboard', function(req, res){
  var collection = db.get().collection('scorecollection');

  collection
    .find()
    .limit(10)
    .sort({ time: 1 })
    .toArray(function(err, high_scores) {
      res.render('leaderboard', {
        high_scores: high_scores,
        time_formatter: function() {
          return function(t_raw, render){
            var t = render(t_raw);
            var sec_num = parseInt(t, 10) / 1000;
            var minutes = Math.floor(sec_num / 60);
            var seconds = Math.floor(sec_num - (minutes * 60));
            var ms = Math.floor((sec_num - (minutes * 60) - seconds) * 100);

            if (minutes < 10) { minutes = "0" + minutes; }
            if (seconds < 10) { seconds = "0" + seconds; }
            if (ms < 10) { ms = "0" + ms;}
            var time = minutes + ':' + seconds + ':' + ms;
            return time;
          }
        }
      });
    })
});

app.post('/leaderboard', function(req, res){
  var collection = db.get().collection('scorecollection');
  collection.insert([{  name: req.body.name, time: Number(req.body.time) }], function(err) {
    if (err) {
      console.error.bind(console, 'error inserting new score into DB');
    } else {
      collection
        .find()
        .limit(10)
        .sort({ time: 1 })
        .toArray(function(err, high_scores) {
          res.send(JSON.stringify(high_scores));
        });
    }
  });
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
