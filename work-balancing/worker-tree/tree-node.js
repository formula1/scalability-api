var WebSocket = require('websocket').w3cwebsocket;
var wrtc = require('wrtc');
var TreeNode = require('../abstract/tree-maintainer/node');

var RTCPeerConnection = wrtc.RTCPeerConnection;
var RTCSessionDescription = wrtc.RTCSessionDescription;
var RTCIceCandidate = wrtc.RTCIceCandidate;

var WRTCTreeNode = function(socket, maxWorkers){
  TreeNode.call(this);
  this.socket = socket;
  socket.addEventListener('message', function(message){
    message = JSON.parse(message);
    switch(message.type){
      case 'nodeID':
        this.nodeID = message.data;
        socket.send(`{maxWorkers:${maxWorkers}}`);
      case 'create-offer':
        this.setParent(message);
      case 'offer-accept':
        this.addChild(message)
      case 'accept-finalize':
        this.parent.setRemoteDescription(
          new RTCSessionDescription(message.data)
        );
      case 'ice':
        this.handleICERecieve(message);

    }

    node.onicecandidate = handleICEProvide.bind(this, node);
  });
};

proto = TreeNode;

proto.setParent = function(message){
  var node = new RTCPeerConnection();
  node.nodeID = message.data;
  node.dataChannel = node.createDataChannel('worker');
  node.dataChannel.onopen = this.socket.send.bind(this.socket, '{type:"ready"}');

  node.dataChannel.onmessage = function(event) {
    var message = JSON.parse(event.data);
    switch(message.type){
      case 'work':
        this.doWork(message).then(function(ret){
          return node.dataChannel.send(JSON.stringify({type:'finishedWork', data:ret}));
        });

    }
  }.bind(this);

  node.onclose = this.socket.send.bind(this.socket, '{type:"abandoned"}');

  node.freeWorker = function(){
    node.dataChannel.send('{type:"freeworker"}');
  };

  return new Promise(node.createOffer)
  .then(function(desc){
    return Promise.all(
      new Promise(node.setLocalDescription.bind(node,new RTCSessionDescription(desc))),
      Promise.resolve(desc)
    );
  }).then(function(ret){
    this.setParent(node);
    this.socket.send(JSON.stringify({
      to: node.nodeID,
      type: 'offer-accept',
      data: ret[1],
    }));
  }.bind(this));
};

proto.addChild = function(message){
  var node = new RTCPeerConnection();
  node.nodeID = message.from;
  node.ondatachannel = function(event){
    node.dataChannel = event.channel;
    node.dataChannel.onopen = function(){
      this.socket.send('{type:"ready"}');
      this.freeWorker(node);
    }.bind(this);

    node.dataChannel.onmessage = function(event) {
      var message = JSON.parse(event.data);
      switch(message.type){
        case "freeworker": return this.freeWorker(node);
        case "finishedWork": return this.workerFinishedWork(node, data.data);
      }
    }.bind(this);

    node.provideWork = function(work){
      node.dataChannel.send(JSON.stringify({
        type: 'work',
        data: work
      }));
    };


    return new Promise(node.setRemoteDescription.bind(node,
      new RTCSessionDescription(message.data)
    )).then(function(){
      return new Promise(node.createAnswer.bind(node));
    }).then(function(desc){
      return Promise.all(
        new Promise(node.setLocalDescription.bind(node,
          new RTCSessionDescription(desc)
        )),
        Promise.resolve(desc)
      );
    }).then(function(ret){
      this.setParent(node);
      this.socket.send(JSON.stringify({
        to: node.nodeID,
        type: 'accept-finalize',
        data: ret[1],
      }));
    }.bind(this));
  }.bind(this);
};

proto.handleICEProvide = function(node, candidate){
  if(!candidate.candidate) return;
  this.socket.send({
    to: node.nodeID,
    type: 'ice',
    data: candidate.candidate,
  });
};

proto.handleICERecieve = function(message){
  var node;
  if(message.from === this.parent.nodeID){
    node = parent;
  }else{
    node = this.children.get(message.from);
    if(!node) throw new Error('not for me');
  }

  node.addIceCandidate(message.data);
};

if(process.env !== 'node' || !modules.parent){
  var commander = Require('commander');
  commander.option('-h', '--host', 'The Host that holds the worker-tree this will connect to');
  commander.option('-max', '--max-workers', 'The maximum number of workers this can accept');
  commander.parse(process.argv);

  var socket = new WebSocket(commander.host);
  new WRTCTreeNode(socket, commander['max-workers']);
}else{
  module.exports = WRTCTreeNode;
}
