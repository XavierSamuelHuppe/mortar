
var mortarClient = {
	socket: null,
	players: {},
	sandbags: [],
	onPlayerJoinedCallback: null,
	onPlayerLeftCallback: null,
	onTankDestroyedCallback: null,

	joinGame: function (host = "localhost", name, callback, callbackContext) {
		socket = io.connect('http://'+ host +':3000');
		socket.on('connect', function () {
    		socket.emit('join', name, function(joinState) {
					players = joinState.players;
					sandbags = joinState.sandbagStates;
					callback.call(callbackContext, joinState);
				});
			}
		);

  		socket.on('news', function (data) {
    		console.log(data);
  		});

  		socket.on('allPlayers', function (allPlayers){
			players = allPlayers;
  		});

  		socket.on('playerJoined', function (player){
  			if(onPlayerJoinedCallback) {
				onPlayerJoinedCallback.callback.call(onPlayerJoinedCallback.context, player);
			}
  		});

	  	socket.on('playerLeft', function (playerId){  			  		
	  		if(onPlayerLeftCallback) {
				onPlayerLeftCallback.callback.call(onPlayerLeftCallback.context, playerId);				
			}
			delete players[playerId];
	  	});

  		socket.on('tankDestroyed', function (playerId){
  			if(onTankDestroyedCallback) {
				onTankDestroyedCallback.callback.call(onTankDestroyedCallback.context, playerId);
			}
  		});
	},

	onPlayerJoined: function(callback, callbackContext) {
		onPlayerJoinedCallback = {callback: callback, context: callbackContext};
	},

	onPlayerLeft: function(callback, callbackContext) {
		onPlayerLeftCallback = {callback: callback, context: callbackContext};
	},

	onTankDestroyed: function(callback, callbackContext) {
		onTankDestroyedCallback = {callback: callback, context: callbackContext};
	},

	notifyState: function(state) {
		socket.emit('newState', state);
	},

	notifyTankDestroy: function(id) {
		socket.emit('destroy', id);
	},

	notifySandbagDestroy: function(id) {
		socket.emit('sandbagDestroy', id);
	},	

	getPlayers: function() {
		return players;
	},

	getSandbagStates: function() {
		return sandbags;
	},
}
