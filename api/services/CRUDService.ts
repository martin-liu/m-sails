declare var _:any;
declare var sails:any;
declare var MysqlService:any;

class CRUDService {
  static async get(table:string, criteria:Object) {
     if (!table || !criteria) {
      throw new Error("Missing argument: table or criteria");
    }

   let sql = `SELECT * FROM ${table} where 1=1 `;
    _.forOwn(criteria, (v, k) => {
      sql += ` and ${k} = '${v}'`;
    });
    return MysqlService.query(sails.config.mysql, sql);
  }

  static async add(table:string, data:any){
    if (!table || !data) {
      throw new Error("Missing argument: table or data");
    }

    let sql = `INSERT INTO ${table} `;
    if (!_.isArray(data)) {
      data = [data];
    }

    let cols = [];
    _.forOwn(data[0], (v, k) => cols.push(k));

    sql += `(${cols.join()}) VALUES`;

    sql += _.map(data, (d) => {
      return `('${_.map(cols, (c) => d[c]).join("', '")}')`;
    }).join();

    return await MysqlService.query(sails.config.mysql, sql);
  }

  async updateOrAdd(table:string, cretaria:Object, data:Object) {

  }
}

export = CRUDService;
