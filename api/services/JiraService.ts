declare var sails:any;

declare var _:any;
const request = require('request-promise');

const severityMap = {
  P0: '1-Critical',
  P1: '1-Critical',
  P2: '2-Major',
  P3: '3-Average',
  'undefined': '3-Average'
}

function autoParse(body, response, resolveWithFullResponse) {
  if (response.headers['content-type'] === 'application/json') {
    return JSON.parse(body);
  } else {
    return body;
  }
}

function post(uri, params) {
  let options = {
    method: 'POST',
    uri,
    transform: autoParse,
    auth: {
      user: sails.config.api.jira.user,
      pass: sails.config.api.jira.password
    },
    followAllRedirects: true,
    json: true,
    body: params
  };
  return request(options);
}

function get(uri, params?) {
    let options = {
    method: 'GET',
    uri,
    transform: autoParse,
    auth: {
      user: sails.config.api.jira.user,
      pass: sails.config.api.jira.password
    },
    followAllRedirects: true,
    json: true,
    qs: params
  };
  return request(options);
}

class JiraService {
  /*
     {
      project: {
        key: state.project
      },
      summary: state.summary,
      description: state.description,
      assignee: {
        name: state.assignee
      },
      issuetype: {
        name: 'Bug'
      },
      customfield_11205: {
        value: severityMap[state.priority]
      },
      customfield_11206: {
        value: 'Production'
      },
      customfield_11207: {
        value: 'Automated Test'
      },
      customfield_11208: {
        value: 'Testing'
      },
      customfield_11209: [{
        value: state.type
      }]
    }
    */
  static async createTicket(state) {
    let uri = sails.config.api.jira.url + 'issue';
    return await post(uri, state);
  }

  /*
    {
    "jql": "key in ('xxx-1', 'xxx-2')",
    "maxResults": 100,
    "fields": [
        "summary",
        "status",
        "assignee"
    ]
    }
    */
  static async searchTickets(state) {
    let uri = sails.config.api.jira.url + 'search';
    return await post(uri, state);
  }

  static async searchTicketsByKey(keys: Array<string>) {
    let jql = `key in ('${keys.join("', '")}')`;
    let options = {
      jql,
      maxResults: keys.length,
      fields: [
        "status",
        "assignee"
      ]
    };
    return await JiraService.searchTickets(options);
  }

  static async getTicketStatus(key: string) {
    let uri = sails.config.api.jira.url + 'issue/' + key;
    return await get(uri, {fields: 'status'})
  }

  static async updateTicketStatus(key: string, statusFlow: Array<string>, resolution: string, comment?: string) {
    let commented = false;
    let updated = false;
    let transitionUri = sails.config.api.jira.url + 'issue/' + key + '/transitions';
    for (let status of statusFlow) {
      let ret = await get(transitionUri);
      if (ret && ret.transitions) {
        let transition = _.find(ret.transitions, d => d.name == status);
        if (transition) {
          let param:any = {
            fields: {
              resolution: {
                name: resolution
              }
            },
            transition: {
              id: transition.id
            }
          };

          if (!commented && comment) {
            param.update = {
              comment: [
                {
                  add: {
                    body: comment
                  }
                }
              ]
            };
            commented = true;
          }

          await post(transitionUri, param);
          updated = true;
        }
      }
    }
    return updated;
  }

  static async closeTicket(key: string, resolution: string, comment?: string) {
    return await JiraService.updateTicketStatus(key, ['Resolve Issue', 'Close Issue'], resolution, comment);
  }

  static async checkUserAssignable(project: string, username: string) {
    let uri = sails.config.api.jira.url + 'user/assignable/search';
    let ret = await get(uri, {project, username});
    if (ret && ret.length == 1) {
      return ret[0].name;
    } else {
      return null;
    }
  }
}

export = JiraService;
