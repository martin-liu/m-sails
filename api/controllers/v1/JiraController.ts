declare var JiraService:any;
declare var Utils:any;

class JiraController {
  async createTicket(req, res) {
    let state = Utils.getParamState(req);
    return res.json(await JiraService.createTicket(state));
  }
}

module.exports = new JiraController();
