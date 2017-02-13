var http, _;

_ = require('lodash');

http = require('http');

_.extend(exports, {
  delta: function() {
    var options, req;
    options = sails.config.bg.solr;
    req = http.request({
      host: options.host,
      port: options.port,
      path: "" + options.path + "/" + options.core + "/dataimport?command=delta-import",
      method: 'GET'
    }, function(res) {});
    req.on('error', function(e) {
      return console.log("Solr Data Import Delta Request Error: " + e.message);
    });
    return req.end();
  },
  deleteMetric: function(id) {
    var options, req;
    options = sails.config.bg.solr;
    req = http.request({
      host: options.host,
      port: options.port,
      path: "" + options.path + "/" + options.core + "/update?stream.body=<delete><query>_id:ME_" + id + "</query></delete>&commit=true",
      method: 'GET'
    }, function(res) {});
    req.on('error', function(e) {
      return console.log("Solr Data Import DeleteMetric Request Error: " + e.message);
    });
    return req.end();
  }
});
