var VM = require('vm2');

var sandbox = { fns: { } };

var vm = new VM({
  timeout: 1000 * 60,
  sandbox: sandbox,
  requireNative: [
    'assert',
    'buffer',
    'constants',
    'crypto',
    'querystring',
    'url',
    'events',
    'path',
    'stream',
    'timers',
    'util',
    'zlib',
    'vm',
  ],
});

module.exports = function(message){
  if(!(message.fnId in sandbox.fns)){
    vm.run(`fns[${message.fnID}] = ${message.fn};`);
  };

  var p = Promise.resolve().then(function(){
    return vm.call(fns[message.fnID], message.data);
  });

  p.then(function(ret){
    return {
      messageID: message.messageID,
      ret: ret,
    };
  });

  p.catch(function(err){
    return {
      messageID: message.messageID,
      err: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    };
  });

  return p;
}

process.on('message', function(message){
  if(!(message.fnId in sandbox.fns)){
    vm.run(`fns[${message.fnID}] = ${message.fn};`);
  };

  var p = Promise.resolve().then(function(){
    return vm.call(fns[message.fnID], message.data);
  });

  p.then(function(ret){
    process.send({
      messageID: message.messageID,
      ret: ret,
    });
  });

  p.catch(function(err){
    process.send({
      messageID: message.messageID,
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
      },
    });
  });

});
