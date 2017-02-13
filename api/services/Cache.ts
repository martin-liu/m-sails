declare var sails:any;
declare var _:any;
declare var Redis:any;

var generateKey, getDB;

const crypt = require('crypto');

getDB = function() {
  return sails.config.base.mongo.cache.db;
};

generateKey = function(key) {
  var sha1;
  key = _.isString(key) ? key : JSON.stringify(key);
  sha1 = crypt.createHash('sha1');
  sha1.update(key);
  return sha1.digest('hex');
};

function getKey(ns, key) {
  return ns + ':' + generateKey(key);
}

module.exports = {
  generateKey: generateKey,
  getDefaultExpire: function() {
    return sails.config.default.cacheExpires;
  },
  get: function(ns, key) {
    return new Promise((resolve, reject) => {
      Redis.getClient().getAsync(getKey(ns, key)).then((data) => {
        var ret;
        try {
          ret = JSON.parse(data);
        } catch (e) {
          ret = data;
        }
        return resolve(ret);
      }, reject);
    });
  },
  set: function(ns, key, value, expire) {
    key = getKey(ns, key);
    expire = parseInt(expire);
    value = JSON.stringify(value);
    if (expire && _.isNumber(expire) && expire > 0) {
      return Redis.getClient().setAsync(key, value, 'EX', expire);
    } else {
      return Redis.getClient().setAsync(key, value);
    }
  },
  remove: function(ns, key) {
    return Redis.getClient().delAsync(getKey(ns, key));
  },
  removeAll: function(ns) {
    var client = Redis.getClient();
    return client.keysAsync(ns + ':*').then(function(ret){
      if (ret && ret.length){
        return client.delAsync.apply(client, ret);
      }
      return 0;
    });
  }
};
