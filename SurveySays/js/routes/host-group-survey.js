hostRoutes.push({
	path: ':groupId/:surveyId',
	component: {
		beforeRouteEnter: function(to, from, next) {
			var route = "/host",
				bc = [0, breadcrumbs.length,
					{
						text: "Home",
						url: "/"
					},
					{
						text: "Host",
						route: route
					},
					{
						text: to.params.groupId,
						route: route += "/" + encodeURIComponent(to.params.groupId)
					},
					{
						active: true,
						text: "Survey"
					}];
			breadcrumbs.splice.apply(breadcrumbs, bc);
			next(vm => vm.loadSurvey(to.params.groupId, to.params.surveyId));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.loadSurvey(to.params.groupId, to.params.surveyId);
			next();
		},
		data: function() {
			return {
				editQuestion: "",
				groupId: null,
				questionProblem: null,
				surveyId: null,
				survey: null,
				surveyProblem: null
			};
		},
		methods: {
			answerClick: function(e) {

			},
			loadSurvey: function(groupId, surveyId) {
				var t = this;
				if(groupId == t.groupId && surveyId == t.surveyId)
					return;
				t.survey = null;
				apiService.loadSurvey(t.groupId = groupId, t.surveyId = surveyId)
					.then(survey => t.survey = survey, problem => t.surveyProblem = problem || "Invalid survey");
			},
			questionEdit: function(e) {
				this.editQuestion = this.survey.question || "";
				e.preventDefault();
			},
			questionSave: function(e) {
				var t = this;
				if(t.editQuestion) {
					t.questionProblem = 0;
					if(t.survey.question != t.editQuestion) {
						t.survey.question = t.editQuestion;
						apiService.saveSurvey(t.survey)
							.then(survey => {
								$('#question_modal').modal('hide');
								t.questionProblem = null;
							}, x => t.questionProblem = x || "There was a problem saving the question.");
						return;
					}
				}
				$('#question_modal').modal('hide');
			},
			saveSurvey: function() {
			}
		},
		template: `<div class="container">
	<h2>Survey</h2>
	<div v-if="survey">
		<div class="game">
			<p class="lead"><a href="#question_modal" data-toggle="modal" @click="questionEdit($event)">{{survey.question}}</a></p>
			<survey-board class="survey-active" :answers="survey.answers" @answer-click="answerClick($event)"></survey-board>
			<button type="button" class="btn btn-outline-primary">Add an Answer</button>
		</div>
	</div>
	<div v-else-if="surveyProblem">{{surveyProblem}}</div>
	<div v-else>Loading...</div>
	<div class="modal fade" id="question_modal" tabindex="-1" aria-labelledby="question_title" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="question_title">Survey Question</h5>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="survey_question">Survey Question</label>
						<input id="survey_question" class="form-control" :class="{'is-invalid': questionProblem}" v-model.trim="editQuestion" required="required" aria-describedby="survey_question_problem" />
						<div id="survey_question_problem" class="invalid-feedback" v-show="questionProblem">{{questionProblem}}</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" @click="questionSave($event)" :disabled="questionProblem === 0">OK</button>
				</div>
			</div>
		</div>
	</div>
</div>`
	}
});