declare var SMSService:any;

class SMSController {
  async sendSMS(req, res) {
    let to = req.param('to');
    if (!to) throw new Error('Missing parameter: to');
    let body = req.param('body');
    if (!body) throw new Error('Missing parameter: body');

    return res.json(await SMSService.sendSMS(to, body));
  }
}

module.exports = new SMSController();
