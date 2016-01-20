
var Manager = require('./abstract/manager');
var doWork = require('./abstract/worker');

var SingleThreaded;
module.exports = SingleThreaded = function(){
  this.FN2id = new Map();
};

var proto = SingleThreaded.proto;

proto.createWork = Manager.prototype.createWork;

SingleThreaded.prototype.doWork = function(todo, data){
  return doWork(this.createWork(todo, data))
  .then(function(ret){
    if(ret.error){
      var err = new Error(ret.error.message);
      err.name = ret.error.name;
      err.stack = ret.error.stack;
      throw err;
    }

    return ret.ret;
  });
};
