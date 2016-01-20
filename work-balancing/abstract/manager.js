var cp = require('child_process');
var makeId = require('uid');

var Manager, proto, messageHandler, reconstructError;

module.exports = Manager = function(){
  this.workers = [];
  this.queue = [];
  this.FN2id = new Map();
  this.ID2Work = new Map();
};

proto = Manager.prototype;

proto.doWork = function(fn, data){
  if(typeof fn !== 'function'){
    return promise.reject('Work requires a function');
  }

  var item = {
    promise: new Promise(),
    message: this.createWork(fn, data)
  };

  if(this.workers.length > 0){
    this.giveWorkerWork(this.workers.pop(), item);
  }else{
    this.queue.unshift(item);
  }

  return item.promise;
};

proto.proxyWork = function(message){
  var item = {
    promise: new Promise(),
    message: message,
  };
  if(this.workers.length > 0){
    this.giveWorkerWork(this.workers.pop(), item);
  }else{
    this.queue.unshift(item);
  }

  return item.promise;
};

proto.createWork = function(fn, data){
  var fnID;
  if(this.FN2id.has(fn)){
    fnID = this.FN2id.get(fn);
  }else{
    fnID = makeID();
    this.FN2id.set(fn, fnID);
  }

  return {
    messageID: makeID(),
    fnID: fnID,
    fn: fn.toString(),
    data: data,
  };

};

proto.giveWorkerWork = function(worker, item){
  this.ID2Work.set(item.message.messageID, item);
  if(!worker.pendingWork){
    worker.pendingWork = new Set();
  }

  worker.pendingWork.add(item);
  worker.provideWork(item.message);
};

proto.freeWorker = function(worker){
  if(this.queue.length > 0){
    this.giveWorkerWork(worker, this.queue.pop());
  }else if(this.workers.indexOf(worker) === -1){
    this.workers.unshift(worker);
  }
}

proto.workerFailed = function(worker){
  var items = worker.pendingWork.values();
  worker.pendingWork.clear();
  var i = this.workers.indexOf(worker);
  if(i > -1) this.workers.splice(i, 1);

  while(items.length){
    if(this.workers.length > 0){
      this.giveWorkerWork(this.workers.pop(), items.pop());
    }else{
      this.queue.push(items.shift());
    }
  }
};

proto.workerFinishedWork = function(worker, message){
  var promise = this.ID2Work.get(message.messageID).promise;
  if(worker.pendingWork.length === 0) this.freeWorker(worker);
  if(message.error) promise.reject(reconstructError(message.error));
  else promise.resolve(message.ret);
};

reconstructError = function(err){
  var nerr = new Error();
  nerr.name = err.name;
  nerr.message = err.message;
  nerr.stack = err.stack;
  return nerr;
};
