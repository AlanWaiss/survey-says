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
				question: "",
				questionProblem: null,
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
			surveySave: function(event) {
				var t = this,
					question = t.question.trim();
				if(!question)
					t.questionProblem = "You must enter a question.";
				else {
					t.questionProblem = 0;
					apiService.saveSurvey({
						groupId: t.groupId,
						question: question
					})
						.then(survey => t.$router.push("/host/" + encodeURIComponent(t.groupId) + "/" + encodeURIComponent(survey.id)), problem => t.questionProblem = problem || "There was a problem saving the survey.");
				}
			},
			surveyUrl: function(survey) {
				return '/host/' + encodeURIComponent(this.groupId) + '/' + encodeURIComponent(survey.id);
			}
		},
		template: `<div class="container">
	<h2>Group</h2>
	<div v-if="group">
		<p class="lead">{{group.name}}</p>
		<div v-if="group.text" v-html="groupHtml" class="form-group"></div>

		<h3>Your Surveys</h3>
		<div v-if="surveysProblem" class="alert alert-danger">{{surveysProblem}}</div>
		<div v-else-if="!surveys">Loading...</div>
		<ul v-else-if="surveys.length > 0">
			<li v-for="survey in surveys">
				<router-link :to="surveyUrl(survey)">{{survey.question}}</router-link>
			</li>
		</ul>
		<div v-else>There aren't any surveys in this group</div>
		<div class="form-group">
			<button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#survey_modal">Create a survey</button>
		</div>

		<h3>Your Games</h3>
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

	<div class="modal fade" id="survey_modal" tabindex="-1" aria-labelledby="survey_title" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="survey_title">New Survey</h5>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="survey_question">Survey Question</label>
						<input id="survey_question" class="form-control" :class="{'is-invalid': questionProblem}" v-model="question" required="required" aria-describedby="survey_question_problem" />
						<div id="survey_question_problem" class="invalid-feedback" v-show="questionProblem">{{questionProblem}}</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" @click="surveySave($event)" :disabled="questionProblem === 0">OK</button>
				</div>
			</div>
		</div>
	</div>
</div>`
	}
});