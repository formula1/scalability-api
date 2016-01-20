
var Manager = require('../manager');
var doWork = require('../worker');

var TreeNode;

module.exports = TreeNode = function(){
  this.parent = void 0;
  this.manager = new Manager();
};

var proto = TreeNode.prototype;

proto.doWork = function(message_or_fn, data) {
  if(!this.parent){
    return this.manager.doWork(message_or_fn, data);
  }

  if(this.manager.workers.length){
    this.parent.freeWorker(this);
    return this.manager.proxyWork(message);
  }else{
    return doWork(message).then(function(ret){
      this.parent.freeWorker(this);
      return ret;
    }.bind(this));
  }
};

proto.setParent = function(node){
  this.parent = node;
};

proto.freeWorker = function(node){
  this.manager.freeWorker(node);
};

proto.workerFailed = function(node){
  this.manager.workerFailed(node);
};
