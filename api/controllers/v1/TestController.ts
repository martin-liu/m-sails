declare var DownloadService:any;
declare var MysqlService:any;

class TestController {
  async test(req, res) {
    return res.json({
      value: await new Promise((rs) => setTimeout(() => rs(1), 1000))
    });
  }

  async test2(req, res) {
    res.json(await MysqlService.query(sails.config.mysql, 'select 1'));
  }

  csv(req, res) {
    return DownloadService.csv(res, 'test.csv', [{a:1, b:2}], {headers: ['b']})
  }
}

module.exports = new TestController();
