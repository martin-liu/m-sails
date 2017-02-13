declare var WrapperService:any;
declare var DownloadService:any;
declare var _:any;
declare var sails:any;

function getParam(req, key, defaultValue?) {
  return req.param(key) || (req.body && req.body[key]) || defaultValue;
}

/*
 *  Provides service to query Kylin & HBase data
 *
 */
class WrapperController {

  async kylin(req, res) {
    let config = getParam(req, 'config');
    let kylinObject = getParam(req, 'kylin');
    let result;
    if (config && kylinObject) {
      let headers = {
        "Content-Type": req.headers["content-type"],
        Authorization: req.headers.authorization
      };
      result = await WrapperService.kylin(config, kylinObject, headers);
    } else {
      throw new Error('Missing parameter: config or kylin');
    }
    return res.json(result);
  }

  async hbase(req, res) {
    let config = getParam(req, 'config');
    let result;
    if (config) {
      result = await WrapperService.hbase(config);
    } else {
      throw new Error('Missing parameter: config');
    }
    return res.send(result);
  }

  // csv options see https://github.com/C2FO/fast-csv
  csvFromKylin(req, res) {
    let body = getParam(req, 'body');
    if (_.isString(body)){
      body = JSON.parse(body);
    }
    let config = body.config;
    let kylinObject = body.kylin;
    let headers = {
      "Content-Type": 'application/json',
      Authorization: sails.config.api.kylin.authorization
    };

    let filename = body.filename || 'download.csv';
    let options = body.csvOptions;

    let stream = WrapperService.kylinstream(config, kylinObject, headers);
    return DownloadService.csvFromStream(res, filename, stream, options);
  }
}

module.exports = new WrapperController();
