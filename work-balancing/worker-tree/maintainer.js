var TreeMaintainer = require('../abstract/tree-maintainer');

var MultiProcessManager, proto, messageHandler, reconstructError;

module.exports = MultiProcessManager = function(port){
  TreeMaintainer.call(this);
  this.IDtoNode = new Map();
};

proto = MultiProcessManager.prototype = Object.create(Manager.prototype);

proto.handleSocket = function(driver){
  driver.on('close', this.nodeLeft.bind(this, driver));
  driver.messages.on('message', handleMessage);
  driver.provideWork = provideWork;
  driver.nodeID = makeID();
  this.IDtoNode.add(driver.nodeID, driver);
  driver.start();
  driver.text(`{type:nodeID, data:${driver.nodeID}}`);
  this.addChild(worker);
};

proto.connectChildToParent = function(child, parent){
  child.text(JSON.stringify({
    type: 'create-offer',
    to: parent.nodeID
  }));
  var p = new Promise();
};

handleMessage = function(worker, message){
  message = JSON.parse(message);
  if(message.to){
    message.from = worker.nodeID;
    var to = this.IDtoNode.get(message.to);
    if(!to) return;
    if(to !== worker.parent && !worker.children.has(to)) return;
    to.text(JSON.stringify(message));
  }
  switch(message.type){
    case 'ready':
      var transaction = this.pendingNodes.get(worker);
      if(!transaction.ready){
        transaction.ready = 1;
        return;
      }

      return transaction.promise.resolve();
    case 'abandoned':
      var node = this.IDtoNode.get(message.data);
      if(!node) return;
      this.nodeLeft(node);
  }
};
