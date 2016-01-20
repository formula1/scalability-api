var doWork = require('../abstract/worker');

process.on('message', function(message){
  doWork(message).then(function(retMessage){
    process.send(retMessage);
  });
});
