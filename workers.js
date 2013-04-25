var serverCommon = process.env.SERVER_COMMON;

var appInitUtils = require(serverCommon + '/lib/appInitUtils'),
    winston = require(serverCommon + '/lib/winstonWrapper').winston,
    serverCommonConf = require(serverCommon + '/conf'),
    imageUtils = require(serverCommon + '/lib/imageUtils'),
    followLinkUtils = require(serverCommon + '/lib/followLinkUtils'),
    constants = require('./constants'),
    indexingHandler = require(serverCommon + '/lib/indexingHandler'),
    sqsConnect = require(serverCommon + '/lib/sqsConnect');

var initActions = [
    appInitUtils.CONNECT_MONGO
  , appInitUtils.CONNECT_ELASTIC_SEARCH
  //, appInitUtils.MEMWATCH_MONITOR
];


appInitUtils.initApp( 'workers', initActions, serverCommonConf, function() {

  var maxWorkers = constants.MAX_WORKER_JOBS;
  if ( process && process.argv && ( process.argv.length > 2 ) ) {
    maxWorkers = process.argv[2];
  }

  winston.doInfo('maxWorkers: ' + maxWorkers);

  sqsConnect.pollWorkerQueue(function (message, pollQueueCallback) {

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

});
