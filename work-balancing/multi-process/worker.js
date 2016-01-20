var doWork = require('../abstract/worker');
var WebSocket = require('websocket').w3cwebsocket;

var ProcessWorker = function(socket){
  socket.addEventListener('message', function(message){
    message = JSON.parse(message);
    doWork(message).then(function(retMessage){
      socket.send(JSON.stringify(retMessage));
    });
  });
};

if(process.env !== 'node' || !modules.parent){
  var commander = Require('commander');
  commander.option('-p', '--port', 'The Port or File this worker should connect to');
  commander.parse(process.argv);
  ProcessWorker(new WebSocket(commander.port));
}else{
  module.exports = ProcessWorker;
}
