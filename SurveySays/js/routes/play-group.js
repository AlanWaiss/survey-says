playRoutes.push({
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
				question: "",
				questionProblem: null
			};
		},
		computed: {
			groupHtml: function() {
				return marked(this.group.text, { sanitize: true });
			}
		},
		methods: {
			gameUrl: function(game) {
				return '/play/' + encodeURIComponent(this.groupId) + '/' + encodeURIComponent(game.id);
			},
			loadData: function(groupId) {
				var t = this;
				groupId = groupId.toLowerCase();
				if(groupId == t.groupId)
					return;

				t.bc = buildRoute()
					.addHome("Play")
					.addRoute("Groups", "play")
					.add(cache.groupName(groupId) || groupId)
					.apply();

				t.groupProblem = t.gamesProblem = null;

				apiService.loadGroup("en", t.groupId = groupId)
					.then(group => {
						t.group = group;
						if(group.name)
							t.bc.active.text = group.name;
					}, problem => t.groupProblem = problem || "There was a problem loading the group.");

				apiService.loadGames(groupId)
					.then(games => t.games = games, problem => t.gamesProblem = problem || "There was a problem loading the games.");
			}
		},
		template: `<div class="container">
	<h2>Group</h2>
	<div v-if="group">
		<p class="lead">{{group.name}}</p>
		<div v-if="group.text" v-html="groupHtml" class="form-group"></div>

		<h3>Available Games</h3>
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