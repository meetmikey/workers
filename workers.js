var serverCommon = process.env.SERVER_COMMON;

var appInitUtils = require(serverCommon + '/lib/appInitUtils'),
    winston = require(serverCommon + '/lib/winstonWrapper').winston,
    serverCommonConf = require (serverCommon + '/conf'),
    imageUtils = require (serverCommon + '/lib/imageUtils'),
    constants = require ('./constants'),
    sqsConnect = require(serverCommon + '/lib/sqsConnect');

var initActions = [
  appInitUtils.CONNECT_MONGO
];


appInitUtils.initApp( 'workers', initActions, serverCommonConf, function() {

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
    else {
      winston.doError ('Unsupported worker job on queue', {job : job});
      pollQueueCallback ();
    }

  }, constants.MAX_WORKER_JOBS);

});