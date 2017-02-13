declare var sails:any;

var ObjectID, getMongo, mongo, mongoDB, mongoExecute;

mongo = require('mongodb').MongoClient;

ObjectID = require('mongodb').ObjectID;

mongoDB = {};

getMongo = function(dbname) {
  return new Promise((resolve, reject) => {
    if (mongoDB[dbname]) {
      resolve(mongoDB[dbname]);
    } else {
      let url = sails.config.base.mongo.url + '/' + dbname;
      mongo.connect(url, function(err, db) {
        if (err) {
          return reject(err);
        } else {
          mongoDB[dbname] = db;
          return resolve(mongoDB[dbname]);
        }
      });
    }
  });
};

mongoExecute = function(dbname, collection, func, funcArgs, func2) {
  return new Promise((resolve, reject) => {
    let handleResponse = (err, data) => err ? reject(err) : resolve(data);
    getMongo(dbname).then((db) => {
      let col = db.collection(collection);
      let f = col[func];
      if (func2) {
        return col[func].apply(col, funcArgs)[func2](handleResponse);
      } else {
        funcArgs.push(handleResponse);
        return col[func].apply(col, funcArgs);
      }
    });
  });
};

module.exports = {
  ObjectID: ObjectID,
  ensureIndex: function(db, collection, keys, options) {
    return mongoExecute(db, collection, 'ensureIndex', [keys, options]);
  },
  find: function(db, collection, params) {
    return mongoExecute(db, collection, 'find', params, 'toArray');
  },
  save: function(db, collection, param) {
    return mongoExecute(db, collection, 'save', [param]);
  },
  update: function(db, collection, criteria, data) {
    return mongoExecute(db, collection, 'update', [criteria, data, {}]);
  },
  remove: function(db, collection, param) {
    return mongoExecute(db, collection, 'remove', [param, null]);
  }
};
