var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(3000);
console.log("Mortar! Get down!");

var players = {};
var sandbagStates = [];
var playerCount = 0;
var previousTimeForStats = Date.now();

function init() {
  for (var i = 0; i < 18; i++) {
    sandbagStates.push(true);
  }
}

init();

io.on('connection', function(socket){  
  socket.on('join', function(params, ack){
    console.log('New layer! : ' + socket.id + ', ' + params.name);

    aNewTank = {id: socket.id, playerNumber: playerCount, name: params.name, tankClass: params.tankClass, tankState: null, ufcCount: 0, ufcPs: 0, ufcMissed: 0, ufcReceived: false, ufcTotalMissed: 0};
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
        players[i].ufcCount++;
        players[i].ufcReceived = true;
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

  socket.on('ping', function (ack) {
        ack();
  });

  socket.on('sandbagDestroy', function(id){
    console.log('One sandbag Destroyed... : ' + id);
    sandbagStates[id] = false;
  });
});

// emit 20 times per second
setInterval(function(){  
  var now = Date.now();
  var resetUfcMissed = false;

  for (var i in players) {
    if(!players[i].ufcReceived) {
      players[i].ufcMissed++;
    } else {
      players[i].ufcReceived = false;      
    }
  }      

  if(now > previousTimeForStats + 1000) {    
    for (i in players) {
      players[i].ufcPs = Math.round((players[i].ufcCount * 1000) / (now - previousTimeForStats));
      players[i].ufcTotalMissed = players[i].ufcMissed;
      players[i].ufcCount = 0; 
    }      
    previousTimeForStats = now;
    resetUfcMissed = true;
  }

  io.emit('allPlayers', players);

  if(resetUfcMissed) {
    for (i in players) {
      players[i].ufcMissed = 0;
    }      
  }
}, 1000/60);  
