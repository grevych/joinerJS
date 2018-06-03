const typeis = require('type-is');
const sprintf = require('sprintf');
const xmlParser = require('xml2js');
const gService = require('gService');
const request = require('request-promise')

const Resource = require('./Resource');
const dependencies = require('../package.json').dependencies;


const API_DEFAULT_TIMEOUT = 3000;
const API_XML_CONTENT_FORMATS = ['xml', '+xml', '*/xml'];
const REQUESTER_GATEWAY = 'requester';
const REQUESTER_SERVICE = 'request-promise';
const REQUESTER_SERVICE_VERSION = dependencies[REQUESTER_SERVICE];


class API {
  constructor(configuration) {
    this.id = configuration.id;
    this.path = configuration.path || '';
    this.version = configuration.version || '';
    this.location = configuration.location;
    this.baseUrl = `${this.location}${this.path}${this.version}`;
    this.environment = configuration.environment || {};
    this.requestOptions = configuration.requestOptions || {};
    this.responseHeaders = configuration.responseHeaders || [];
    this.timeout = configuration.timeout || API_DEFAULT_TIMEOUT;
    this.resources = configuration.resources.reduce((tmp, resource) => {
      tmp[resource.id] = new Resource(resource, this);
      return tmp;
    }, {});
    this.headers = this.getHeaders(configuration.headers);
    this.requester = this.getRequester();
  }

  getRequester() {
    const options = Object.assign({}, this.requestOptions);
    options.url = this.baseUrl;
    options.headers = this.headers;
    options.timeout = this.timeout;
    options.transform = API.transformFormat;
    options.version = REQUESTER_SERVICE_VERSION;
    const requester = gService.create(REQUESTER_GATEWAY, REQUESTER_SERVICE, options);
    requester.setModule(request);
    return requester;
  }

  getHeaders(headers) {
    const envHeaders = API.getEnvironmentVars(this.environment.headers);
    return Object.assign({}, headers, envHeaders);
  }

  static getEnvironmentVars(map = {}) {
    return Object.keys(map).reduce((output, key) => {
      const envVarName = map[key];
      const envVarValue = process.env[envVarName];
      output[key] = (enVarValue) ?
          enVarValue :
          logger.warning(`Missing environment variable ${key} from ${envVarName} environment variable`);
      return output;
    }, {});
  }

  static transformFormat (body, response) {
    if (typeis(response, API_XML_CONTENT_FORMATS)) {
      const parseFunction = (error, parsedBody) => { response.body = parsedBody; };
      xmlParser.parseString(response.body, { explicitArray: false }, parseFunction);
    }
    return response;
  }
}


module.exports = API;
