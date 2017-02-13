declare var ResponseHandler:any;
declare var Cache:any;

module.exports = {
  _config: {},
  set: function(req, res) {
    var state;
    state = {
      ns: req.param('ns'),
      key: req.param('key'),
      value: req.param('value'),
      expire: req.param('expire')
    };
    return ResponseHandler.respond(res, Cache.set(state.ns, state.key, state.value, state.expire));
  },
  get: function(req, res) {
    var state;
    state = {
      ns: req.param('ns'),
      key: req.param('key')
    };
    return ResponseHandler.respond(res, Cache.get(state.ns, state.key));
  },
  remove: function(req, res) {
    var state;
    state = {
      ns: req.param('ns'),
      key: req.param('key')
    };
    return ResponseHandler.respond(res, Cache.remove(state.ns, state.key));
  },
  removeAll: function(req, res) {
    var state;
    state = {
      ns: req.param('ns')
    };
    return ResponseHandler.respond(res, Cache.removeAll(state.ns));
  }
};
