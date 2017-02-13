declare var sails:any;

const twilio = require('twilio');

var client;

function getClient(){
  if (!client) {
    client = new twilio.RestClient(sails.config.api.sms.sid, sails.config.api.sms.token);
  }
  return client;
}

class SMSService {
  static async sendSMS(to: string, body: string) {
    if (!to || !body) {
      throw new Error("[SMSService -- sendSMS] Missing arguments: `to` or `body`");
    }

    if (to.indexOf('+') != 0) {
      to = '+' + to;
    }

    return await new Promise((rs, rj) => {
      getClient().messages.create({
        from: sails.config.api.sms.from_phone_number, to, body
      }, (err, message) => {
        if (!err) {
          rs(message);
        } else {
          rj(err);
        }
      });
    })
  }
}

export = SMSService;
