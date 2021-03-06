﻿hostRoutes.push({
	path: ':groupId/:surveyId/:gameId',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.loadData(to.params.groupId, to.params.surveyId, to.params.gameId));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.loadData(to.params.groupId, to.params.surveyId, to.params.gameId);
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
				gameId: null,
				groupId: null,
				surveyId: null,
				game: null,
				survey: null,
				surveyProblem: null
			};
		},
		methods: {
			answerClick: function(e) {
				var t = this;
				if(t.game && t.survey) {
					var update = $.extend(true, {}, t.game);
					update.answers[e.index] = update.answers[e.index] ? null : $.extend({}, e.answer);
					gameHub.send('GameUpdate', update);
				}
			},
			connect: function(groupId, gameId) {
				var t = this;
				t.disconnect();
				gameHub.on("gameUpdate", this.c_gameUpdate = (game => {
					audioService.gameUpdate(t.game, game);
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
			},
			incorrect: function() {
				if(this.game) {
					var update = $.extend(true, {}, this.game);
					update.strikes++;
					gameHub.send('GameUpdate', update);
				}
			},
			loadData: function(groupId, surveyId, gameId) {
				var t = this;
				gameId = gameId.toLowerCase();
				groupId = groupId.toLowerCase();
				surveyId = surveyId.toLowerCase();

				t.bc = buildRoute()
					.addHome("Host")
					.addRoute("Groups", "host")
					.addRoute(cache.groupName(groupId) || groupId, groupId)
					.addRoute("Survey", surveyId)
					.add("Host Game")
					.apply();

				if(groupId != t.groupId || gameId != t.gameId) {
					t.gameId = gameId;
					t.connect(groupId, gameId);
				}
				if(groupId == t.groupId && surveyId == t.surveyId)
					return;

				t.survey = t.surveyProblem = null;
				apiService.loadSurvey(t.groupId = groupId, t.surveyId = surveyId)
					.then(survey => t.survey = survey, problem => t.surveyProblem = problem || "Invalid survey");
			},
			removeStrike: function(event) {
				if($(event.target).is('.strike') && this.game && this.game.strikes > 0) {
					var update = $.extend(true, {}, this.game);
					update.strikes--;
					gameHub.send('GameUpdate', update);
				}
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
						<survey-board class="survey-active" :answers="survey.answers" :selected="game && game.answers" @answer-click="answerClick($event)"></survey-board>
					</div>
				</div>
				<div v-else-if="surveyProblem">{{surveyProblem}}</div>
				<div v-else>Loading...</div>

				<div class="strike-counter">
					<button class="btn btn-outline-danger" @click="incorrect">Incorrect</button>
				</div>
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
					<answer-board :answers="game.answers" prefix="game_answer_"></answer-board>
					<strike-counter :strikes="game.strikes" @click.native="removeStrike($event)"></strike-count>
				</div>
			</div>
			<div v-else class="card-body">Loading...</div>
			<div class="card-footer">This is how the game currently appears to players</div>
		</div>
	</div>
</div>`
	}
});