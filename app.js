var express = require('express');
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
    console.log('Listening on port 3000!');
});
