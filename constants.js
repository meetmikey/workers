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
var thumbnailer = process.env.IS_THUMBNAILER;

define ('USE_REINDEXING_QUEUE', false);
define ('MAX_WORKER_JOBS', 20);
define ('CLOUD_ENV', cloudEnvironment);
define ('NODE_ENV', environment);
define ('MAX_INVALIDATION_JOBS', 10);
define ('MAX_WORKER_THUMBNAIL_JOBS', 20);
define ('THUMBNAILER', thumbnailer);
