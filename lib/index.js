const API = require('./API');
const Endpoint = require('./Endpoint');


function _getAPIs(configuration) {
  return configuration.reduce((tmp, api) => {
      tmp[api.id] = new API(api);
      return tmp;
  }, {});
}

function _getEndpoints(configuration, apis) {
  return configuration.reduce((tmp, endpoint) => {
    const api = apis[endpoint.match.api];
    const resource = api && api.resources[endpoint.match.resource];
    tmp[endpoint.id] = new Endpoint(endpoint, apis, resource);
    return tmp;
  }, {});
}

class Joiner {
  constructor(entrypoint) {
    this.apis = _getAPIs(entrypoint.apis);
    this.endpoints = _getEndpoints(entrypoint.endpoints, this.apis);
  }
}


module.exports = Joiner;
