var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(3000);
console.log("Mortar! Get down!");

var tanks = [];

io.on('connection', function(socket){
  var socketId = socket.id;
  console.log('New tank! : ' + socketId);
  aNewTank = {id: socketId, x:0, y:0};
  tanks.push(aNewTank);

  socket.on('disconnect', function(){
    console.log('One tank left... : ' + socket.id);
    for (var i in tanks) {
    	if (tanks[i].id == socket.id) {
    		tanks.splice(i,1);
    		break;
     	}
   	}
  });
  socket.on('newPosition', function(msg){
  	for (var i in tanks) {
    	if (tanks[i].id == socket.id) {
    		tanks[i].x = msg.x;
    		tanks[i].y = msg.y;
    		break;
     	}
   	}
   	io.emit('allPositions', tanks);
  });
});