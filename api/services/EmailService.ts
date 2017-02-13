declare var sails:any;

const email = require('nodemailer');
var server;

function getServer() {
  if (!server) {
    server = email.createTransport(`smtp://${sails.config.email.host}`);
  }
  return server;
}

class EmailService {
  /**
   *  @param {Object} state
            - example:
            {
             from: 'xx@yy.com', // sender address
             to: 'xx@yy.com', // list of receivers
             subject: 'Hello ✔', // Subject line
             text: 'Hello world ?', // plaintext body
             html: '<b>Hello world ?</b> here is an image: <img src="cid:my_image">' // html body
             ,
             attachments: [{
               filename: 'image.png',
               path: 'img path',
               cid: 'my_image' //same cid value as in the html img src
             }]
           }
   */
  static async sendEmail(state) {
    return new Promise((rs, rj) => {
      getServer().sendMail(state, (err, ret) => err ? rj(err) : rs(ret));
    });
  }
}

export = EmailService;
