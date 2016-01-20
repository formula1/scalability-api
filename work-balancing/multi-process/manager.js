var Manager = require('../abstract/manager');
var Server = require('http').Server;
var WebsocketDriver = require('websocket-driver');

var MultiProcessManager, proto, messageHandler, reconstructError;

module.exports = MultiProcessManager = function(port){
  Manager.call(this);
  this.server = new Server();
  this.server.on('upgrade', function(request, socket, body){
    if (!websocket.isWebSocket(request)) return;
    var driver = websocket.http(request);
    driver.io.write(body);
    socket.pipe(driver.io).pipe(socket);
  }.bind(this));
};

proto = MultiProcessManager.prototype = Object.create(Manager.prototype);

proto.handleSocket = function(driver){
  driver.on('close', this.workerFailed.bind(this, driver));
  driver.messages.on('message', handleMessage);
  driver.provideWork = provideWork;
  driver.start();
  this.freeWorker(worker);
};

provideWork = function(work){
  this.messages.send(JSON.stringify(work));
};

handleMessage = function(worker, message){
  this.workerFinishedWork(worker, JSON.parse(message));
};
