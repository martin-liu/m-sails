module.exports = function (sails) {

  return {
    // Runs automatically when the hook initializes
    initialize: function (cb) {
      // bluebird
      global.Promise = require("bluebird");

      console.log('loading polyfills("bluebird")....');

      Promise.config({
        monitoring:true
      });

      // global exception handler
      Promise.onPossiblyUnhandledRejection(function(error, promise) {
        if (promise.currentRes && !promise.currentRes.finished) {
          return ResponseHandler.err(promise.currentRes)(error);
        } else {
          return sails.log.error(error);
        }
      });

      // when promise created, bind current response to it
      process.on('promiseCreated', function(promise){
        if (sails.m) {
          var res = sails.m.currentRes;
          if (res) {
            promise.currentRes = res;
          }
        }
      });

      return cb();
    }
  };
};
