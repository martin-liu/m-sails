var ResponseHandler;

ResponseHandler = {
  err: function(res) {
    return function(err) {
      var ret;
      sails.log.error(err);
      ret = {
        error: err,
        info: err.message
      };
      if (err.message && err.message.indexOf('alert:') === 0) {
        ret.message = err.message.substring(6);
      }
      return res.status(500).json(ret);
    };
  },
  respond: function(res, promise, successFunc, errFunc) {
    if (successFunc == null) {
      successFunc = function(ret) {
        return res.json(ret);
      };
    }
    if (errFunc == null) {
      errFunc = ResponseHandler.err(res);
    }
    return promise.then(successFunc)["catch"](errFunc);
  }
};

module.exports = ResponseHandler;
