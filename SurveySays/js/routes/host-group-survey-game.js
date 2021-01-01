hostRoutes.push({
	path: ':groupId/:surveyId/:gameId',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => {
				vm.loadSurvey(to.params.groupId, to.params.surveyId);
				vm.connect(to.params.groupId, to.params.gameId);
			});
		},
		beforeRouteUpdate: function(to, from, next) {
			this.disconnect();
			this.loadSurvey(to.params.groupId, to.params.surveyId);
			this.connect(to.params.groupId, to.params.gameId);
			next();
		},
		beforeRouteLeave: function(to, from, next) {
			this.disconnect();
			next();
		},
		computed: {
			gameUrl: function() {
				return window.location.origin + "/play/" + encodeURIComponent(this.$route.params.groupId) + "/" + encodeURIComponent(this.$route.params.gameId);
			}
		},
		data: function() {
			return {
				game: null,
				survey: null
			};
		},
		methods: {
			answerClick: function(e) {
				var t = this;
				if(t.game && t.survey) {
					var update = $.extend(true, {}, t.game);
					update.answers[e.index] = $.extend({}, e.answer);
					gameHub.send('GameUpdate', update);
				}
			},
			connect: function(groupId, gameId) {
				var t = this;
				t.disconnect();
				gameHub.on("gameUpdate", this.c_gameUpdate = (game => t.game = game));
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
			},
			loadSurvey: function(groupId, surveyId) {
				var t = this;
				fetchJson('/api/survey/' + encodeURIComponent(groupId) + '/' + encodeURIComponent(surveyId))
					.then(data => t.survey = data);
			}
		},
		template: `<div class="container-fluid pt-3">
	<div class="card-deck">
		<div class="card">
			<div class="card-body">
				<h2 class="card-title">Survey</h2>
				<div v-if="survey">
					<div class="game">
						<p class="lead">{{survey.question}}</p>
						<survey-board :answers="survey.answers" :selected="game && game.answers" @answer-click="answerClick($event)"></survey-board>
					</div>
				</div>
				<div v-else>Loading...</div>
			</div>
			<div class="card-footer">
				Link to play: <a :href="gameUrl">{{gameUrl}}</a>
			</div>
		</div>
		<div class="card">
			<div v-if="game" class="card-body">
				<h2>{{ game.name }}</h2>
				<div class="game">
					<p class="lead">{{game.question}}</p>
					<answer-board :answers="game.answers"></answer-board>
				</div>
			</div>
			<div v-else class="card-body">Loading...</div>
			<div class="card-footer">This is how the game currently appears to players</div>
		</div>
	</div>
</div>`
	}
});