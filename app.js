require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mustacheExpress = require('mustache-express');
const app = express();
const db = require('./db');

const MAX_NAME_LENGTH = 24;

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
  const collection = db.get().collection('scorecollection');

  collection
    .find()
    .limit(10)
    .sort({ time: 1 })
    .toArray(function(err, high_scores) {
      res.render('leaderboard', {
        high_scores: high_scores,
        time_formatter: function(){ return time_formatter }
      });
    })
});

app.post('/leaderboard', function(req, res){
  const collection = db.get().collection('scorecollection');
  collection.insert([{
    name: req.body.name.substring(0, MAX_NAME_LENGTH),
    time: Number(req.body.time)
  }], function(err) {
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

const time_formatter = function(t_raw, render){
    let t = render(t_raw);
    let sec_num = parseInt(t, 10) / 1000;
    let minutes = Math.floor(sec_num / 60);
    let seconds = Math.floor(sec_num - (minutes * 60));
    let ms = Math.floor((sec_num - (minutes * 60) - seconds) * 100);

    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    if (ms < 10) { ms = "0" + ms;}
    let time = minutes + ':' + seconds + ':' + ms;
    return time;
};
