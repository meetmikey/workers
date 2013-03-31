var serverCommon = process.env.SERVER_COMMON;
var utils = require(serverCommon + '/lib/utils');

function define(name, value) {
  Object.defineProperty(exports, name, {
    value : value,
    enumerable: true
  });
}

var environment = process.env.NODE_ENV;
var cloudEnvironment = process.env.CLOUD_ENV;

define ('MAX_WORKER_JOBS', 30);