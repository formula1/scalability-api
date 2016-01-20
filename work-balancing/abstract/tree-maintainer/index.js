var FreeNodeList = require('./free-node-list');
var makeID = require('uid');

var TreeMaintainer, proto, messageHandler, reconstructError;

module.exports = TreeMaintainer = function(){
  this.freeNodes = new FreeNodeList();
  this.pendingNodes = new Map();
};

proto = TreeMaintainer.prototype;

proto.addChild = function(child){
  return this.freeNodes.popNode()
    .then(this.connectChildToParent.bind(this, child))
    .then(function(parent){
      if(!child.children) child.children = new Set();
      parent.children.add(child);
      child.parent = parent;
      this.freeNodes.addFreeNode(parent);
      this.freeNodes.addFreeNode(child);
      return true;
    }).catch(function(type){
      if(type === 'parent-left'){
        return this.addChild(child);
      }

      if(type === 'child-left'){
        return false;
      }

      if(type === 'root-left'){
        throw new Error('Root node has left');
      }

      throw type;
    }.bind(this));
};

proto.connectChildToParent = function(child, parent){
  // this is an abstract function that is expected to return a promise
  var p = child.connectTo(parent);
  var transaction = {
    parent: parent,
    child: child,
    promise: p,
  };
  this.pendingNodes.add(parent, transaction);
  this.pendingNodes.add(child, transaction);
  return p.then(function(){
    delete transaction.promise;
    this.pendingNodes.remove(parent);
    this.pendingNodes.remove(child);
    return transaction;
  }.bind(this));
};

proto.setAsRoot = function(node){
  this.root = node;
  this.freeNodes.setAsRoot(node);
  return Promise.resolve(true);
};

proto.nodeLeft = function(node){
  this.removeFreeNode(node);

  // if its in the process of connecting
  if(this.pendingNodes.has(node)){
    var transaction = this.pendingNodes.get(node);
    // if its a child that was getting a parent
    if(node === transaction.child){
      // we get to exit early
      this.pendingNodes.remove(transaction.parent);
      this.pendingNodes.remove(node);
      transaction.promise.reject('child-left');
      return;
    }

    // if the parent left
    if(node === transaction.parent){
      // we must re add the child;
      this.pendingNodes.remove(node);
      this.pendingNodes.remove(child);
      transaction.promise.reject('parent-left');
    }

    // we must do the rest of the cleanup with a parent
  }

  // We must disconnect the node from its parent
  var parent = node.parent;
  parent.children.remove(node);
  this.addFreeNode(parent);

  var children = node.children.values();
  node.children.clear();
  return Promise.all(children.map(this.addChild.bind(this)));
};
