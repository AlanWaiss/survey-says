hostRoutes.push({
	path: ':groupId',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.loadData(to.params.groupId));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.loadData(to.params.groupId);
			next();
		},
		data: function() {
			return {
				games: null,
				gamesProblem: null,
				groupId: null,
				group: null,
				groupProblem: null,
				surveys: null,
				surveysProblem: null
			};
		},
		computed: {
			groupHtml: function() {
				return marked(this.group.text, { sanitize: true });
			}
		},
		methods: {
			gameUrl: function(game) {
				return '/host/' + encodeURIComponent(this.groupId) + '/' + encodeURIComponent(game.surveyId) + '/' + encodeURIComponent(game.id);
			},
			loadData: function(groupId) {
				var t = this;
				groupId = groupId.toLowerCase();
				if(groupId == t.groupId)
					return;

				t.bc = buildRoute()
					.addRoute("Host", "host")
					.add(groupId)
					.apply();

				t.groupProblem = t.gamesProblem = t.surveysProblem = null;

				apiService.loadGroup(t.groupId = groupId)
					.then(group => {
						t.group = group;
						if(group.name)
							t.bc.active.text = group.name;
					}, problem => t.groupProblem = problem || "There was a problem loading the group.");

				apiService.loadSurveys(groupId, {
					host: user.id
				})
					.then(surveys => t.surveys = surveys, problem => t.surveysProblem = problem || "There was a problem loading the surveys.");

				apiService.loadGames(groupId, {
					host: user.id
				})
					.then(games => t.games = games, problem => t.gamesProblem = problem || "There was a problem loading the games.");
			},
			surveyUrl: function(survey) {
				return '/host/' + encodeURIComponent(this.groupId) + '/' + encodeURIComponent(survey.id);
			}
		},
		template: `<div class="container">
	<h2>Group</h2>
	<div v-if="group">
		<p class="lead">{{group.name}}</p>
		<div v-if="group.text" v-html="groupHtml"></div>

		<h3 class="mt-3">Your Surveys</h3>
		<div v-if="surveysProblem" class="alert alert-danger">{{surveysProblem}}</div>
		<div v-else-if="!surveys">Loading...</div>
		<ul v-else-if="surveys.length > 0">
			<li v-for="survey in surveys">
				<router-link :to="surveyUrl(survey)">{{survey.question}}</router-link>
			</li>
		</ul>
		<div v-else>There aren't any surveys in this group</div>

		<h3 class="mt-3">Your Games</h3>
		<div v-if="gamesProblem" class="alert alert-danger">{{gamesProblem}}</div>
		<div v-else-if="!games">Loading...</div>
		<ul v-else-if="games.length > 0">
			<li v-for="game in games">
				<router-link :to="gameUrl(game)">{{game.name}} ({{game.question || "new"}})</router-link>
			</li>
		</ul>
		<div v-else>You haven't started any games in this group</div>
	</div>
	<div v-else-if="groupProblem">{{groupProblem}}</div>
	<div v-else>Loading...</div>
</div>`
	}
});