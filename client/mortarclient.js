
var socket = null;
var players = {};
var sandbags = [];
var onPlayerJoinedCallback = null;
var onPlayerLeftCallback = null;
var onTankDestroyedCallback = null;
var allPlayersCalls = 0;
var stateNotificationCalls = 0;
var previousTime = 0;
var statistics = { allPlayersPs: 0, stateNotificationPs: 0};

var mortarClient = {
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
			allPlayersCalls++;
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

	updateStats: function(time) {
		if(time > previousTime + 1000) {			
			statistics.allPlayersPs = Math.round((allPlayersCalls * 1000) / (time - previousTime));
			statistics.stateNotificationPs = Math.round((stateNotificationCalls * 1000) / (time - previousTime));

			previousTime = time;
			allPlayersCalls = 0;
			stateNotificationCalls = 0;
		} 
	},

	getStats: function() {
		return statistics;
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
		stateNotificationCalls++;
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
