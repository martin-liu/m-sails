function processRequest(req, res){
  req.options = req.options || {};

  // WantsJSON
  req.options.wantsJSON = false;

  // auto jsonp
  if (req.param('callback')){
    req.options.jsonp = true;
  }

  // set timeout time
  res.connection.setTimeout(sails.config.default.timeout || 5 * 60 * 1000);

  bindGlobal(res);
}

function bindGlobal(res){
  sails.m = sails.m || {};
  sails.m.currentRes = res;
}

module.exports = function (req, res, next) {

  processRequest(req, res);

  // default go next
  return next();
};
