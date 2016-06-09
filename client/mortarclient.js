var socket;

var allTanks;

var mortarConnect = function(host = "localhost") {
	socket = io.connect('http://'+ host +':3000');

  	socket.on('news', function (data) {
    	console.log(data);
  	});
  	socket.on('allPositions', function (data){
		allTanks = data;
  	});
}

var mortarUpdateMyPosition = function(x, y) {
	socket.emit('newPosition', 
		{ x: x, y: y });
}