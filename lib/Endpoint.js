
const RESOURCE_ID_HEADER = 'JOINERJS_ID';

class Endpoint {
  constructor(configuration, apis, resource) {
    this.apis = apis;
    this.id = configuration.id;
    this.path = configuration.path;
    this.match = configuration.match;
    this.resource = resource;
    this.controller = this._createController();
  }

  _createController() {
    return (req, res) =>
        this.callResource(this.resource, req, res, this.match.parameters)
            .then(response => this.respond(response, req, res, this.resource))
  }

  callResource(resource, req, res, urlParameters) {
    const parameters = this.parameters;
    const method = resource.method;
    const path = resource.createPath({ parameters, req, values: urlParameters });
    const options = Object.assign({}, resource.requestOptions);

    return resource.api.requester
      .request(path, { method, options })
      .then(response => response || DEFAULT_RESPONSE)
      .catch(Endpoint.manageError(res));
  }

  respond(response, req, res, resource) {
    const headers = resource.extractResponseHeaders(response);
    const match = req.params.resourceId || this.match.id;
    res.set(headers);
    res.set(RESOURCE_ID_HEADER, match);
    res.send(response.body);
  }

  static manageError(res) {
    return (error) => {
      const statusCode = error.statusCode || DEFAULT_ERROR_STATUS_CODE;
      logger.error(error);
      res.status(statusCode).send(error);
    };
  }
}


module.exports = Endpoint;
