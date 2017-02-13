declare var _:any;
declare var ResponseHandler:any;

const csv = require('fast-csv');

class DownloadService {
  public static csv(res, filename:string, data:Array<any>, options){
    options = options || {};
    if (!options.headers) {
      options.headers = true;
    }

    res.attachment(filename);
    csv.write(data, options).pipe(res);
  }

  public static async csvFromStream(res, filename:string, stream, options){
    options = options || {};
    if (!options.headers) {
      options.headers = true;
    }

    // error handler
    stream.on('error', ResponseHandler.err(res));

    // wait for readable, give time for above error handlering
    await new Promise((rs, rj) => {
      stream.on('readable', rs);
    });

    res.attachment(filename);
    // magic BOM `EF BB BF` for excel to recognize
    res.write('\ufeff');
    let csvStream = csv.createWriteStream(options);
    stream.pipe(csvStream).pipe(res);
  }
}

export = DownloadService;
