'use strict';

var SwaggerExpress = require('swagger-express-ftx');
var app = require('express')();
const swaggerSecurity = require('./api/helpers/swaggerSecurity')
var path = require('path');
module.exports = app; // for testing


var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: swaggerSecurity.swaggerSecurityHandlers
};


SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);
  var port = process.env.PORT || 3000;
  app.listen(port);
});

app.get('/swagger.yaml', function(req, res) {
  res.sendFile(path.join(__dirname, '/api/swagger/swagger.yaml'))
});
