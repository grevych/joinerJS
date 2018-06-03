const sprintf = require('sprintf');


class Resource {
  constructor(configuration, api) {
    this.api = api;
    this.id = configuration.id;
    this.path = configuration.path;
    this.method = configuration.method || 'GET';
    this.headers = configuration.headers || {};
    this.requestOptions = configuration.requestOptions || {};
    this.responseHeaders = this.getResponseHeaders(configuration.responseHeaders);
  }

  getResponseHeaders(headers = []) {
    const responseHeaders = (headers).concat(this.api.responseHeaders);
    return new Set(responseHeaders);
  }

  extractResponseHeaders(response) {
    return Object.values(this.responseHeaders)
        .reduce((key, tmp) => {
          const header = response.headers[key];
          tmp[key] = (header) ? header : logger.warning(`Property ${key} not in response`);
        }, {});
  }

  static formatParameters(parameters, query = {}) {
    const mapParameters = parameters.map || [];
    const queryParameters = parameters.query || [];
    const params = Object.keys(mapParameters).reduce((tmp, key) => {
      if (key in query) tmp.push(`${mapParameters[key]}=${query[key]}`);
      return tmp;
    }, []);
    const completeParams = new Set(queryParameters.concat(params));
    return [...completeParams];
  }

  static setQueryParams(path, parameters = []) {
    if (!parameters.length) {
      return path;
    }
    const queryParameters = parameters.join('&');
    return `${path}?${queryParameters}`;
  }

  createPath({ parameters = {}, req = {}, values = null, path = null } = {}) {
    const urlParameters = parameters.url || [];
    const params = values || urlParameters.map(parameter => req.params[parameter]);
    const basePath = sprintf.vsprintf(path || this.path, params);
    const formattedParameters = Resource.formatParameters(parameters, req.query);
    return Resource.setQueryParams(basePath, formattedParameters);
  }
}


module.exports = Resource;
