import * as moment from 'moment';

declare var _:any;
declare var Cache:any;

let Utils = {
  dateFormat: function(dt, fmt) {
    var k, o;
    o = {
      "M+": dt.getMonth() + 1,
      "d+": dt.getDate(),
      "h+": dt.getHours(),
      "m+": dt.getMinutes(),
      "s+": dt.getSeconds(),
      "q+": Math.floor((dt.getMonth() + 3) / 3),
      "S": dt.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (dt.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }
    return fmt;
  },

  /*
    this function help to check the restriction for input or output data, set default value or force overwrite it
    note: keys not exists in rules will removed from data, it's a white list

    example    # operation priority is ascending, when they exits in one key
    -------
      rule:
        id:
          required: true          # when required is true, "id" must be provided
        name:
          defaultsTo: 'my name'   # if name is not defined, it will use 'my name' as default value
                                   * function(without parameters) are supported
        upd_date:
          setTo: '2013-02-01'     # cre_date will be set to '2013-02-01', whether it's undefined or not
                                   * function(without parameters) are supported
        cre_date:
          transform: (v) -> new Date v
                                   * need a lambda function here, with a parameter for origial value
   */
  dataRefine: function(data, rule) {
    var conf, e, key, refinedData;
    refinedData = {};
    for (key in rule) {
      conf = rule[key];
      if (data[key] !== void 0) {
        refinedData[key] = data[key];
      }
      if (conf.required && data[key] === void 0) {
        return [data, new Error("Key '" + key + "' is undefined")];
      }
      if (conf.defaultsTo !== void 0 && data[key] === void 0) {
        if (conf.defaultsTo instanceof Function) {
          try {
            refinedData[key] = conf.defaultsTo();
          } catch (_error) {
            e = _error;
            return [data, e];
          }
        } else {
          refinedData[key] = conf.defaultsTo;
        }
      }
      if (conf.setTo !== void 0) {
        if (conf.setTo instanceof Function) {
          try {
            refinedData[key] = conf.setTo();
          } catch (_error) {
            e = _error;
            return [data, e];
          }
        } else {
          refinedData[key] = conf.setTo;
        }
      }
      if (refinedData[key] !== void 0 && conf.transform instanceof Function) {
        try {
          refinedData[key] = conf.transform(refinedData[key]);
        } catch (_error) {
          e = _error;
          return [data, e];
        }
      }
    }
    return [refinedData, null];
  },
  outerCrossJoin: function(data1, data2, keys1, keys2) {
    var arrToMapNull, d1, d2, joint, k1, k2, results, _i, _j, _k, _l, _len, _len1, _len2, _len3;
    arrToMapNull = function(arr) {
      var a, mapNull, _i, _len;
      mapNull = {};
      for (_i = 0, _len = arr.length; _i < _len; _i++) {
        a = arr[_i];
        mapNull[a] = null;
      }
      return mapNull;
    };
    if ((_.intersection(keys1, keys2)).length > 0) {
      throw new Error("outerCrossJoin keys duplicated");
    }
    results = [];
    if (data1.length === 0 && data2.length !== 0) {
      data1 = [arrToMapNull(keys1)];
    }
    if (data2.length === 0 && data1.length !== 0) {
      data2 = [arrToMapNull(keys2)];
    }
    for (_i = 0, _len = data1.length; _i < _len; _i++) {
      d1 = data1[_i];
      for (_j = 0, _len1 = data2.length; _j < _len1; _j++) {
        d2 = data2[_j];
        joint = {};
        for (_k = 0, _len2 = keys1.length; _k < _len2; _k++) {
          k1 = keys1[_k];
          joint[k1] = (function() {
            if (d1[k1] === void 0) {
              throw new Error("key '" + k1 + "' is undefined in outerCrossJoin");
            } else {
              return d1[k1];
            }
          })();
        }
        for (_l = 0, _len3 = keys2.length; _l < _len3; _l++) {
          k2 = keys2[_l];
          joint[k2] = (function() {
            if (d2[k2] === void 0) {
              throw new Error("key '" + k2 + "' is undefined in outerCrossJoin");
            } else {
              return d2[k2];
            }
          })();
        }
        results.push(joint);
      }
    }
    return results;
  },
  relativeSort: function(results, key, ids) {
    var i, map, _i, _ref;
    map = {};
    for (i = _i = _ref = ids.length - 1; _ref <= 0 ? _i <= 0 : _i >= 0; i = _ref <= 0 ? ++_i : --_i) {
      map[ids[i]] = i;
    }
    results.sort(function(a, b) {
      return map[a[key]] - map[b[key]];
    });
    return results;
  },
  mapGroup: function(arr, key, values) {
    var i, k, map, tmp, v, _i, _j, _len, _len1;
    map = {};
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      i = arr[_i];
      k = i[key];
      if (map[k] == null) {
        map[k] = [];
      }
      tmp = {};
      for (_j = 0, _len1 = values.length; _j < _len1; _j++) {
        v = values[_j];
        tmp[v] = i[v];
      }
      map[k].push(tmp);
    }
    return map;
  },
  select: function(data, attrs) {
    var col:any, cpRec, rec, results, _i, _j, _len, _len1;
    results = [];
    for (_i = 0, _len = data.length; _i < _len; _i++) {
      rec = data[_i];
      cpRec = {};
      for (_j = 0, _len1 = attrs.length; _j < _len1; _j++) {
        col = attrs[_j];
        if (!(col in rec)) {
          throw new Error("attribute '" + col + "' is undefined in function Utils.select");
        }
        cpRec[col] = rec[col];
      }
      results.push(cpRec);
    }
    return results;
  },
  getParam: function(req, param, defaultVal) {
    var ret;
    if (defaultVal == null) {
      defaultVal = '';
    }
    ret = req.param(param);
    if (!ret) {
      ret = defaultVal;
    }
    return ret;
  },
  getParamState: function(req, defaultData) {
    var state;
    state = _.clone(req.allParams());
    state = _.assignWith(state, defaultData, function(oldV, newV) {
      if (!oldV) {
        return newV;
      } else {
        return oldV;
      }
    });
    return _.forOwn(state, function(v, k) {
      var arr;
      arr = k.split('.');
      if (arr.length === 2 && arr[1] && _.has(state, arr[0])) {
        if (state[arr[0]].on == null) {
          if (state[arr[0]] === 'true') {
            state[arr[0]] = {
              on: true
            };
          } else {
            state[arr[0]] = {
              on: false
            };
          }
        }
        if (state[arr[0]].on) {
          state[arr[0]][arr[1]] = v;
          return delete state[k];
        }
      }
    });
  },
  getWithCache: function(ns, key, func, expire) {
    return new Promise(function(resolve, reject){
      Cache.get(ns, key).then(function(ret) {
        if (ret) {
          return resolve(ret);
        } else {
          return func().then(function(data) {
            resolve(data);
            Cache.set(ns, key, data, expire);
            return data;
          }).catch(function(e){
            return reject(e);
          });
        }
      }, (e) => {
          console.error("[Utils.getWithCache] Error: " + e);
          func().then(resolve);
        });
    });
  },
  getWhereCriteria: function(obj, prefix?) {
    let criteria = ' 1 = 1';
    if (_.isObject(obj)) {
      _.forOwn(obj, (v, k) => {
        if (prefix) {
          k = prefix + '.' + k;
        }
        if (v) {
          criteria += ` and ${k} = '${v}'`;
        }
      })
    }
    return criteria;
  },
  getDate: (dayOffset:number = 0, timezone = '-0700') => {
    return moment().utcOffset(timezone).subtract(dayOffset, 'days').format('YYYY-MM-DD');
  },
  getTime: (specificDate = Utils.getDate(), timezone = '-0700') => {
    let m = moment().utcOffset(timezone);
    let diff = m.diff(moment(specificDate), 'days');
    return moment().utcOffset(timezone).subtract(diff, 'days').format('YYYY-MM-DD HH:mm:ss');
  },
  cloneExclude: (obj, excludes) => {
    let ret = _.clone(obj);
    _.forEach(excludes, d => delete ret[d]);
    return ret;
  }
};

module.exports = Utils;
