playRoutes.push({
	path: ':groupId/:gameId',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.connect(to.params.groupId, to.params.gameId));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.connect(to.params.groupId, to.params.gameId);
			next();
		},
		beforeRouteLeave: function(to, from, next) {
			this.disconnect();
			next();
		},
		data: function() {
			return {
				game: null
			};
		},
		methods: {
			connect: function(groupId, gameId) {
				var t = this;

				t.bc = buildRoute()
					.addHome("Play")
					.addRoute("Groups", "play")
					.addRoute(cache.groupName(groupId) || groupId, groupId)
					.add("Game")
					.apply();

				t.disconnect();
				gameHub.on("gameUpdate", this.c_gameUpdate = (game => {
					t.game = game;
					if(game.name)
						t.bc.active.text = game.name;
				}));
				t.c_groupId = groupId;
				t.c_gameId = gameId;
				startHubAsync().then(function() {
					gameHub.send("joinGame", {
						groupId: groupId,
						id: gameId
					});
				});
			},
			disconnect: function() {
				var t = this;
				if(t.c_gameUpdate) {
					gameHub.send("leaveGame", {
						groupId: t.c_groupId,
						id: t.c_gameId
					});
					gameHub.off("gameUpdate", t.c_gameUpdate);
					delete t.c_gameUpdate;
					delete t.c_groupId;
					delete t.c_gameId;
				}
			}
		},
		template: `<div class="container">
	<div v-if="game" class="game">
		<h2>{{ game.name }}</h2>
		<p class="lead">{{game.question}}</p>
		<answer-board :answers="game.answers"></answer-board>
	</div>
	<div v-else>Loading...</div>
</div>`
	}
})