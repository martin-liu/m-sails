declare var sails:any;
declare var _:any;
declare var Utils:any;
var connect, getConnection, mysql, pools, query, queryWithCache, sanitize, transaction;

mysql = require('mysql');

pools = {};

function generateOptions(options) {
  var op = {
    host: options.host,
    port: options.port ? options.port : 3306,
    user: options.user,
    password: options.password,
    dateStrings: true,
    multipleStatements: true
  };
  if (options.database){
    op['database'] = options.database;
  }
  return op;
}

getConnection = function(options) {
  if (options == null) {
    options = sails.config.mysql;
  }
  return mysql.createConnection(generateOptions(options));
};


/*
  connect(options, callback)
  or connect(callback)
 */

connect = function() {
  var callBack, options;
  if (_.isFunction(arguments[0])) {
    callBack = arguments[0];
  } else if (_.isObject(arguments[0]) && _.isFunction(arguments[1])) {
    options = arguments[0];
    callBack = arguments[1];
  }
  if (!callBack) {
    throw new Error('Parameter type wrong for MysqlService.connect');
  }
  if (options == null) {
    options = sails.config.mysql;
  }
  if (pools[options.key] == null) {
    pools[options.key] = mysql.createPool(generateOptions(options));
  }
  return pools[options.key].getConnection(callBack);
};

transaction = function(callBack) {
  return connect(function(err, conn) {
    if (err) {
      return callBack(err, null);
    }
    return conn.beginTransaction(function(transErr) {
      if (transErr) {
        conn.release();
        return callBack(transErr, null);
      }
      return callBack(null, conn);
    });
  });
};

/*
  query with sql
 */
query = function(options, sql, param) {
  return new Promise(function(resolve, reject){
    connect(options, function(err, conn) {
      if (err) {
        return reject(err);
      } else {
        if (param == null) {
          param = {};
        }
        return conn.query(sql, param, function(err, param) {
          if (err) {
            reject(err);
          } else {
            resolve(param);
          }
          return conn.release();
        });
      }
    });
  });
};


/*
  query with sql, and cache param
  params
 */

queryWithCache = function(ns, options, sql, param, expire) {
  return Utils.getWithCache(ns, sql, () => query(options, sql, param), expire);
};

function queryStream(options, sql, param) {
  return new Promise(function(resolve, reject){
    connect(options, function(err, conn) {
      if (err) {
        return reject(err);
      } else {
        if (param == null) {
          param = {};
        }
        var stream = conn.query(sql, param).stream({highWaterMark: 5});
        return resolve(stream);
      }
    });
  });
}


/*
  sanitize sql to prevent sql injection
 */

sanitize = function(s) {
  return s.replace(/-{2,}/, '-').replace(/[*/]+/, '').replace(/(;|\s)(exec|execute|select|insert|update|delete|create|alter|drop|rename|truncate|backup|restore)\s/i, '');
};

module.exports = {
  escape: mysql.escape,
  sanitize: sanitize,
  format: mysql.format,
  getConnection: getConnection,
  connect: connect,
  transaction: transaction,
  query: query,
  queryWithCache: queryWithCache,
  queryStream: queryStream
};
