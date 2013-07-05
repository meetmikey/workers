var serverCommon = process.env.SERVER_COMMON;

var appInitUtils = require(serverCommon + '/lib/appInitUtils'),
    winston = require(serverCommon + '/lib/winstonWrapper').winston,
    serverCommonConf = require(serverCommon + '/conf'),
    imageUtils = require(serverCommon + '/lib/imageUtils'),
    followLinkUtils = require(serverCommon + '/lib/followLinkUtils'),
    constants = require('./constants'),
    memcached = require (serverCommon + '/lib/memcachedConnect'),
    indexingHandler = require(serverCommon + '/lib/indexingHandler'),
    sqsConnect = require(serverCommon + '/lib/sqsConnect');

var initActions = [
    appInitUtils.CONNECT_MONGO
  , appInitUtils.CONNECT_ELASTIC_SEARCH
  //, appInitUtils.MEMWATCH_MONITOR
];

var workersApp = this;

if (constants.CLOUD_ENV === 'aws') {
  initActions.push (appInitUtils.CONNECT_MEMCACHED);
}

appInitUtils.initApp( 'workers', initActions, serverCommonConf, function() {

  serverCommonConf.turnDebugModeOn();

  setTimeout (function () {

    workersApp.startWorkersPolling();

    if (constants.CLOUD_ENV === 'aws') {
      workersApp.startCacheInvalidationPolling();
    }

  }, 10000);

});



exports.startWorkersPolling = function () {

  var maxWorkers = constants.MAX_WORKER_JOBS;
  if ( process && process.argv && ( process.argv.length > 2 ) ) {
    maxWorkers = process.argv[2];
  }

  var pollQueueFunction = sqsConnect.pollWorkerQueue;

  if (constants.USE_REINDEXING_QUEUE) {
    pollQueueFunction = sqsConnect.pollWorkerReindexQueue;
  }

  pollQueueFunction(function (message, pollQueueCallback) {

    var job = JSON.parse (message);

    if (job.jobType === 'thumbnail') {
      imageUtils.doThumbnailingJob (job, function (err) {
        if (err) {
          pollQueueCallback (err);
        }
        else {
          pollQueueCallback ();
        }
      });
    }
    else if (job.jobType === 'index') {
      indexingHandler.doIndexingJob (job, function (err) {
        if (err) {
          pollQueueCallback (err);
        }
        else {
          pollQueueCallback ();
        }
      });
    }
    else if (job.jobType === 'deleteIndex') {
      indexingHandler.doDeleteFromIndexJob (job, function (err) {
        if (err) {
          pollQueueCallback (err);
        }
        else {
          pollQueueCallback ();
        }
      });
    }
    else if (job.jobType === 'followLink') {
      followLinkUtils.doFollowLinkJob(job, function (err) {
        if (err) {
          pollQueueCallback (err);
        }
        else {
          pollQueueCallback ();
        }
      });
    }
    else {
      winston.doError ('Unsupported worker job on queue', {job : job});
      pollQueueCallback ();
    }

  }, maxWorkers);

}


exports.startCacheInvalidationPolling = function () {

  var maxWorkers = constants.MAX_INVALIDATION_JOBS;

  var pollQueueFunction = sqsConnect.pollCacheInvalidationQueue;

  pollQueueFunction(function (message, pollQueueCallback) {

    var job = JSON.parse (message);

    memcached.delete (job._id, function (err) {
      if (err) {
        pollQueueCallback (err);
      } else {
        pollQueueCallback ();
      }
    });

  }, maxWorkers);

}
