

var FreeNodeList;

module.exports = FreeNodeList = function(){
  this.root = void 0;
  this.sortedLevels = new Map();
  this.queued = [];
};

proto = FreeNodeList.prototype;

proto.setAsRoot = function(node){
  this.root = node;
  node.level = 0;
  var level = [node];
  level.level = 0;
  this.sortedLevels.add(0, level);
};

proto.removeRoot = function(){
  while(this.queue.length){
    this.queued.pop().p.reject('This Tree does\'t have a root node');
  }
  this.root = void 0;
};


proto.addNode = function(node){
  node.level = node.parent.level + 1;

  if(this.queued.length){
    this.queued.shift().resolve(node);
    return;
  }

  // if we are at maximum, skip this child
  if(node.children.length === node.maxChildren){
    return;
  }

  var ari = this.sortedLevels.get(node.level);
  if(!ari){
    ari = [];
    this.sortByLevels.add(node.level, ari);
  }

  ari.push(node);
  ari.sort(sortByChildrenLength());
};

proto.popNode = function(child){
  if(!this.root){
    return Promise.reject('This Tree doesn\'t have a root node');
  }

  if(!this.sortedLevels.length){
    var p = new Promise();
    this.queued.push({
      child: child,
      p: p,
    });
    return p;
  }

  var key = this.sortedLevels.keys().sort()[0];
  var level = this.sortedLevels.get(key);
  var parent = level.pop();
  if(!level.length) this.sortedLevels.remove(key);
  return Promise.resolve(parent);
};

proto.removeNode = function(node){
  var level = this.sortedLevels.get(node.level);
  var i = level.indexOf(node);
  if(i > -1){
    level.splice(i, 1);
    if(!level.length) this.sortedLevels.remove(node.level);
  }else{
    for(i = 0, l = this.queued.length; i < l; i++){
      if(this.queued[i].child === node){
        this.queued.splice(i, 1)[0].reject('child-left');
        break;
      }
    }
  }
};

sortByLevels = function(a, b){
  a.level - b.level;
};

sortByChildrenLength = function(a, b){
  b.children.length - a.children.length;
};
