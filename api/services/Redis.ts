declare var sails:any;
const redis = require('redis');
const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client = null;

function getClient(options) {
  if (!client || client.connected == false) {
    if (options == null) {
      options = sails.config.redis;
    }
    options.retry_strategy = (ret):any => {
      if (ret.error.code === 'ECONNREFUSED') {
        // End reconnecting on a specific error and flush all commands with a individual error
        return new Error('The server refused the connection');
      }
      if (ret.total_retry_time > 1000 * 10) {
        // End reconnecting after a specific timeout and flush all commands with a individual error
        return new Error('Retry time exhausted');
      }
      if (ret.times_connected > 10) {
        // End reconnecting with built in error
        return new Error('Connected fail for more than 10 times');
      }
      // reconnect after
      return Math.max(ret.attempt * 100, 1000);
    }

    client = redis.createClient(options);

    client.on("error", (e) => {
      console.error(e);
    });
  }

  return client;
};

module.exports = {
  getClient: getClient
};
