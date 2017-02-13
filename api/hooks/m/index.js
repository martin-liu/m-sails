module.exports = function (sails) {

  return {
    // Runs automatically when the hook initializes
    initialize: function (cb) {

      // You must trigger `cb` so sails can continue loading.
      // If you pass in an error, sails will fail to load, and display your error on the console.
      sails.on('router:after', bindVersionRouter);

      return cb();
    }
  };
};

function bindRouter(prefix, ctl) {
  let properties = Object.getOwnPropertyNames(ctl);
  // ignore inherit methods
  properties = _.difference(properties, ['constructor', 'caller', 'arguments', 'apply', 'bind', 'call', 'toString']);
  _.forEach(properties, (k) => {
    let method = ctl[k];
    if(_.isFunction(method)){
      sails.router.bind(prefix + '/' + k, method);
    }
  });
}

function bindVersionizeAPI(version){
  _.forOwn(sails.controllers, function(ctl, key){
    if (key.indexOf(version) == 0){
      var prefix = key.substring(version.length);
      bindRouter(prefix, ctl);
      // for ES6 class
      bindRouter(prefix, Object.getPrototypeOf(ctl));
    }
  });
}

function bindVersionRouter(){
  var version = sails.config.defaultVersion;
  if (version > 0){
    bindVersionizeAPI("v" + version);
  }
}
