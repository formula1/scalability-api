var Manager = require('../abstract/manager');
var cp = require('child_process');

var ChildProcessManager, proto, provideWork;

module.exports = ChildProcessManager = function(num_workers){
  Manager.call(this);
  for(var i = 0; i < num_workers; i++){
    var worker = cp.fork('./worker.js');
    worker.provideWork = provideWork;
    worker.on('message', this.workerFinishedWork.bind(this, worker));
    worker.on('close', this.workerFailed.bind(this, worker));
    this.freeWorker(worker);
  }
};

proto = ChildProcessManager.prototype = Object.create(Manager.prototype);
proto.constructor = ChildProcessManager;

provideWork = function(work){
  this.send(work);
};
