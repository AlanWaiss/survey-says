const _debug = 1,
	CONNECTION_STATUS = {
		Connected: 1,
		Disconnected: 0,
		Pending: 2,
		Trouble: 9,
	},
	gameHub = new signalR.HubConnectionBuilder()
		.withUrl("/gameHub")
		.withAutomaticReconnect()
		.build();

(function() {
	const RECONNECT_DEFAULT = 10000,
		RECONNECT = [
			300,
			600,
			1500,
			3000
		];
	gameHub.onclose(function(x) {
		if(_debug)
			console.log("gameHub connection closed", x);
		//_vm.connectionStatus = CONNECTION_STATUS.Disconnected;
		reconnect();
	});
	gameHub.onreconnected(function(connectionId) {
		if(_debug)
			console.log("gameHub reconnected", connectionId);
		//_vm.connectionStatus = CONNECTION_STATUS.Connected;
	});
	gameHub.onreconnecting(function(x) {
		if(_debug)
			console.log("gameHub reconnecting", x);
		//_vm.connectionStatus = CONNECTION_STATUS.Trouble;
	});
	function reconnect(resolve, reject) {
		if(reconnect.timer || window.closing)
			return;
		reconnect.timer = setTimeout(function() {
			startHubAsync().then(resolve, reject);
		}, RECONNECT[reconnect.attempt] || RECONNECT_DEFAULT);
		reconnect.attempt++;
		console.log("Reconnecting (attempt " + reconnect.attempt + ")...");
	}
	reconnect.attempt = 0;
	reconnect.timer = 0;

	var _started;
	function startHubAsync() {
		reconnect.timer = 0;

		return new Promise((resolve, reject) => {
			if("Connected" == gameHub.state)
				resolve(gameHub);
			else if("Disconnected" != gameHub.state && _started)
				_started.then(resolve, reject);
			else
				_started = gameHub.start()
					.then(function() {
						//_vm.connectionStatus = CONNECTION_STATUS.Connected;
						reconnect.attempt = 0;
						resolve(gameHub);
					}, function(x) {
						console.error("Connection problem", x);
						//_vm.connectionStatus = CONNECTION_STATUS.Disconnected;
						reconnect(resolve, reject);
					});
		});
	}
	window.startHubAsync = startHubAsync;
})();