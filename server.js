var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(3000);
console.log("Mortar! Get down!");

var players = {};
var sandbagStates = [];
var playerCount = 0;

function init() {
  for (var i = 0; i < 18; i++) {
    sandbagStates.push(true);
  }
}

init();

io.on('connection', function(socket){  
  socket.on('join', function(name, ack){
    console.log('New layer! : ' + socket.id + ', ' + name);

    aNewTank = {id: socket.id, playerNumber: playerCount, name: name, tankState: null};
    players[socket.id] = aNewTank;        

    var joinAckState ={ playerId: socket.id, players: players, sandbagStates : sandbagStates };    
    playerCount++;

    ack(joinAckState);
    socket.broadcast.emit('playerJoined', aNewTank);
  });

  socket.on('disconnect', function(){
    console.log('One tank left... : ' + socket.id);
    for (var i in players) {
    	if (players[i].id == socket.id) {
    		delete players[i];
    		break;
     	}
   	}

    io.emit('playerLeft', socket.id);
  });
  socket.on('newState', function(state){
  	for (var i in players) {
    	if (players[i].id == socket.id) {
    		players[i].tankState = state;
    		break;
     	}
   	}
  });
  socket.on('destroy', function(id){
    console.log('One tank Destroyed... : ' + id);
    for (var i in players) {
      if (players[i].id == id) {
        delete players[i];
        socket.broadcast.emit('tankDestroyed', id);
        break;
      }
    }    
  });

  socket.on('sandbagDestroy', function(id){
    console.log('One sandbag Destroyed... : ' + id);
    sandbagStates[id] = false;
  });
});

// emit 20 times per second
setInterval(function(){  
  io.emit('allPlayers', players);
}, 1000/60);  
