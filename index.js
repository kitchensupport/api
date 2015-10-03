var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(
    {"message": "Hello World."}
  ));
});

var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('API is listening at http://%s:%s', host, port);
});
