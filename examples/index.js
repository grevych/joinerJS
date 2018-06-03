const Joiner = require('joinerJS');
const express = require('express');

const entrypoint = require('./entrypoint.json');


let joinContent;
const app = express();
const joiner = new Joiner(entrypoint);
const port = 8080;


const latest = joiner.endpoints['latest-stories'];
latest.controller = (req, res) =>
  latest.callResource(latest.resource, req, res)
      .then(response => (response.body = response.body.eTag) && response)
      .then(response => latest.respond(response, req, res, latest.resource));


Object.values(joiner.endpoints)
    .forEach(endpoint => app.get(endpoint.path, endpoint.controller));

app.listen(port, () => console.log('Starting service at port %s!', port));



