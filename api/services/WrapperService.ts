/**
 * Created by choli on 2016/10/13.
 */
// sails services
declare var sails:any;
declare var _:any;
declare var Promise:any;
declare var Utils:any;
declare var Cache:any;

const Transform = require('stream').Transform;
const requestPromise = require('request-promise');
let oboe = require('oboe');
let request = require('request');
_ = require('lodash');

const KYLIN_NS = 'kylin';
const HBASE_NS = 'hbase';

async function getKylinData(headers, API, sendData) {
  return await new Promise((r, rj) => requestPromise({
    method: 'POST',
    uri: API,
    strictSSL: false,
    headers,
    json: true,
    body: sendData
  }).then(r).catch(rj));
}

function getKylinStream(API, data, headers) {
  let stream = request({
    method: 'POST',
    uri: API,
    strictSSL: false,
    headers,
    json: true,
    body: data
  });

  let retStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      this.push(chunk);
      callback();
    }
  });

  let processJson = () => {
    // write an empty array to avoid missing first line in csv
    retStream.write([]);

    oboe(stream)
      .on('node', {
        'results.*': (r) => {
          retStream.write(r);
        }
      })
      .on('done', () => {
        retStream.end();
      })
      .on('fail', e => {
        retStream.emit('error', e);
      });
  }

  stream.pause();
  stream.on('response', function(res) {
    if (res.statusCode == 200) {
      processJson();
    } else {
      stream.on('data', (errorBuffer) => {
        let error = "Error happend when getting Kylin result: \n" + errorBuffer.toString();
        try {
          error = JSON.parse(errorBuffer.toString());
        } catch (e) {
          // do nothing
        }
        retStream.emit('error', error);
        retStream.end();
      })
    }
    stream.resume();
  })
  .on('error', function(err) {
    retStream.emit('error', err);
  });

  return retStream;
}

async function getHbaseData(url) {
  return await new Promise((r, rj) => requestPromise({
    method: 'GET',
    uri: url,
    strictSSL: false
  }).then(r).catch(rj));
}

async function queryKylin(config, kylinObject, headers) {
  let ns = config.ns || KYLIN_NS;
  let API = config.api || sails.config.api.kylin.prod + 'query';
  let expire = parseInt(config.expire);
  if (isNaN(expire)) {
    return await getKylinData(headers, API, kylinObject);
  } else {
    return Utils.getWithCache(ns, JSON.stringify(kylinObject), async () => {
      return await getKylinData(headers, API, kylinObject);
    }, expire);
  }
}

async function queryHBaseWithCache(config) {
  let ns = config.ns || HBASE_NS;
  let url = config.url;
  let expire = _.isUndefined(config.expire) ? Cache.getDefaultExpire() : config.expire;
  return Utils.getWithCache(ns, url, async () => {
    return await getHbaseData(url);
  }, expire);
}


class WrapperService {

  public static async kylin(config, kylinObject, headers?) {
    return await queryKylin(config, kylinObject, headers);
  }

  public static async hbase(config) {
    return await queryHBaseWithCache(config);
  }

  public static kylinstream(config, kylinObject, headers?) {
    let API = config.api || sails.config.api.kylin.prod + 'query';
    return getKylinStream(API, kylinObject, headers);
  }
}

export = WrapperService;
