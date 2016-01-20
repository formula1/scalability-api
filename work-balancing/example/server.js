var Server = require('http').Server;
var WebsocketDriver = require('websocket-driver');

var SingleThreaded = require('./versions/single-threaded');
var MultiProcess = require('./versions/multi-process/manager');
var MultiThreaded = require('./versions/multi-threaded/manager');
var TreeMaintainer = require('./versions/worker-tree/maintainer');

var treeMaintainer = new TreeMaintainer();
var socketManager = new MultiProcess();

Server.on('upgrade', function(request, socket, body){
  if(!websocket.isWebSocket(request)) return;
  if(!/tree$|process$/.test(request.url)) return;
  var driver = websocket.http(request);
  driver.io.write(body);
  socket.pipe(driver.io).pipe(socket);
  if(/tree$/.test(request.url)) treeMaintainer.handleSocket(driver);
  if(/process$/.test(request.url)) socketManager.handleSocket(driver);
});

var array = [1, 2, 3, 4, 5, 6, 7];

var i = new Iterator(array);

Iterator.map(function(num){
  return num++;
}).then(function(ret){
  console.log(ret);
});
