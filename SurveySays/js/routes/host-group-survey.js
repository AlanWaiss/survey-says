hostRoutes.push({
	path: ':groupId/:surveyId',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.loadData(to.params.groupId, to.params.surveyId));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.loadData(to.params.groupId, to.params.surveyId);
			next();
		},
		data: function() {
			return {
				currentAnswer: null,
				editAnswer: null,
				editQuestion: "",
				games: null,
				gamesProblem: null,
				gameName: "",
				gameProblem: null,
				groupId: null,
				newAnswers: [],
				questionProblem: null,
				surveyId: null,
				survey: null,
				surveyProblem: null
			};
		},
		computed: {
			totalScore: function() {
				var total = 0;
				this.survey.answers.forEach(answer => total += answer.score);
				return total;
			}
		},
		methods: {
			answerClick: function(e) {
				if(e.$event.target && e.$event.target.tagName == "INPUT")
					return;
				var t = this,
					answer = e.answer;
				if(!t.isEdit(answer)) {
					t.editAnswer = {
						$o: {//original data
							score: answer.score || 0,
							text: answer.text || ""
						},
						$src: answer,
						score: answer.score || 0,
						text: answer.text || ""
					};
				}
				t.$nextTick(function() {
					$('#survey_answer_' + e.index + ' input').first().focus();
				})
			},
			answerDelete: function(e, index) {
				this.survey.answers.splice(index, 1);
				this.saveSurvey();
				e.preventDefault();
				e.stopPropagation();
			},
			answerKeyDown: function(e) {
				var t = this,
					$event = e.$event,
					answers = t.survey.answers,
					goTo, goIndex;
				switch($event.key) {
					case "ArrowDown":
						goTo = answers[goIndex = e.index + 1];
						break;
					case "ArrowUp":
						goTo = answers[goIndex = e.index - 1];
						break;
					case "Home":
					case "PageUp":
						goTo = answers[goIndex = 0];
						break;
					case "End":
					case "PageDown":
						goTo = answers[goIndex = answers.length - 1];
						break;
					case "Enter":
						if(t.isEdit(e.answer)) {
							t.editAnswer = null;
							$($event.target).closest('li').focus();
							return;
						}
						t.answerClick(e);
						break;
					case " ":
						if(t.isEdit(e.answer))
							return;
						t.answerClick(e);
						break;
					case "Backspace":
					case "Delete":
						if(t.isEdit(e.answer))
							return;
						t.answerDelete($event, e.index);
						goTo = answers[goIndex = e.index] || answers[goIndex = e.index - 1];	//Now that it's removed, go to the answer that's now in this index or the previous item
						break;
					case "Escape":
						var edit = t.isEdit(e.answer);
						if(edit) {
							edit.$src.text = edit.$o.text;
							edit.$src.score = edit.$o.score;
							t.editAnswer = null;
							t.answerSort();
						}
						else
							return;
					default:
						return;
				}
				$event.preventDefault();
				if(goTo) {
					//if($event.ctrlKey || $event.metaKey || $event.altKey) {
					//	//Move current item
					//	answers.splice(e.index, 1);
					//	answers.splice(goIndex, 0, e.answer);
					//}
					//else
					t.currentAnswer = goTo;

					t.$nextTick(function() {
						$('#survey_answer_' + goIndex).focus();
					});
				}
			},
			answerSort: function() {
				if(this.survey) {
					this.survey.answers.sort(function(a1, a2) {
						//order by score desc, text asc
						var s1 = a1.score,
							s2 = a2.score;
						if(s1 < s2)
							return 1;
						if(s1 > s2)
							return -1;
						s1 = a1.text.toLowerCase();
						s2 = a2.text.toLowerCase();
						if(s1 < s2)
							return -1;
						if(s1 > s2)
							return 1;
						return 0;
					});
					this.saveSurvey();
				}
			},
			gameLink: function(game) {
				return "/host/" + encodeURIComponent(this.groupId) + '/' + encodeURIComponent(this.surveyId) + '/' + encodeURIComponent(game.id);
			},
			gameSave: function(event) {
				var t = this,
					name = t.gameName.trim(),
					lower = name.toLowerCase();
				if(!name)
					t.gameProblem = "You must enter a name for your new game.";
				else if(t.games.find(game => (game.name || game.id).toLowerCase() == lower))
					t.gameProblem = "The game name should be unique.";
				else {
					t.gameProblem = 0;
					apiService.saveGame({
						groupId: t.groupId,
						name: name,
						answers: t.survey.answers.map(answer => null),//Initially all answers are null so they're not shown to players
						question: t.survey.question,
						surveyId: t.surveyId
					})
						.then(game => {
							t.games.push(game);
							$('#game_modal').modal('hide');
							t.gameProblem = null;
						}, problem => t.gameProblem = problem || "There was a problem saving.");
				}
			},
			/**
			 * Gets editAnswer if editing the specified answer
			 * @param {any} answer
			 */
			isEdit: function(answer) {
				var edit = this.editAnswer;
				if(edit && edit.$src == answer)
					return edit;
				return null;
			},
			loadData: function(groupId, surveyId) {
				var t = this;
				groupId = groupId.toLowerCase();
				surveyId = surveyId.toLowerCase();
				if(groupId == t.groupId && surveyId == t.surveyId)
					return;

				t.bc = buildRoute()
					.addRoute("Groups", "host")
					.addRoute(cache.groupName(groupId) || groupId, groupId)
					.add("Survey")
					.apply();

				t.survey = t.surveyProblem = t.gamesProblem = null;

				apiService.loadSurvey(t.groupId = groupId, t.surveyId = surveyId)
					.then(survey => {
						t.survey = survey;
						t.currentAnswer = survey.answers[0];
					}, problem => t.surveyProblem = problem || "Invalid survey");
				apiService.loadGames(groupId, {
					survey: surveyId,
					host: user.id
				})
					.then(games => t.games = games, problem => t.gamesProblem = problem || "Invalid survey");
			},
			newAnswerAdd: function(e) {
				var t = this;
				t.newAnswers.push({
					$o: {
						score: 0,
						text: ""
					},
					$src: {
						score: 0,
						text: ""
					},
					score: 0,
					text: ""
				});
				t.$nextTick(function() {
					$('#new_answer_' + (t.newAnswers.length - 1) + ' input').first().focus();
				});
			},
			newAnswerEdit: function(e) {
				if(e.answer.text && e.answer.score) {
					this.newAnswers.splice(e.index, 1);
					this.survey.answers.push(e.answer);
					this.answerSort();
				}
			},
			newAnswerKeyDown: function(e) {
				var t = this,
					$event = e.$event;
				switch($event.key) {
					case "Escape":
						t.newAnswers.splice(e.index, 1);
						break;
				}
			},
			questionEdit: function(e) {
				this.editQuestion = this.survey.question || "";
				e.preventDefault();
			},
			questionSave: function(e) {
				var t = this,
					question = t.editQuestion.trim();
				if(question) {
					t.questionProblem = 0;
					if(t.survey.question != question) {
						t.survey.question = question;
						t.saveSurvey()
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
				return apiService.saveSurvey(this.survey);
			}
		},
		template: `<div class="container">
	<h2>Survey</h2>
	<div v-if="survey">
		<div class="game">
			<p class="lead"><a href="#question_modal" data-toggle="modal" @click="questionEdit($event)">{{survey.question}}</a></p>
			<ol class="survey-board survey-active list-unstyled">
				<survey-answer v-for="(answer, index) in survey.answers" :answer="answer" :index="index" :tabindex="answer == currentAnswer ? 0 : -1" :edit="isEdit(answer)" @answer-click="answerClick($event)" @answer-keydown="answerKeyDown($event)" @answer-edit="answerSort">
					<div class="btn-group ml-3">
						<button type="button" class="btn btn-outline-secondary fas fa-compress-alt" aria-label="Merge" tabindex="-1"></button>
						<button type="button" class="btn btn-outline-secondary far fa-trash-alt" aria-label="Delete" tabindex="-1" @click="answerDelete($event, index)"></button>
					</div>
				</survey-answer>
			</ol>
			<div class="form-group">{{survey.answers.length}} answer(s), totaling {{totalScore}}</div>
			<ol class="survey-board survey-active list-unstyled">
				<survey-answer v-for="(answer, index) in newAnswers" :answer="answer.$src" :index="index" tabindex="0" :edit="answer" prefix="new_answer_" @answer-keydown="newAnswerKeyDown($event)" @answer-edit="newAnswerEdit"></survey-answer>
			</ol>
			<button type="button" class="btn btn-outline-primary" @click="newAnswerAdd($event)">Add an Answer</button>
		</div>
	</div>
	<div v-else-if="surveyProblem">{{surveyProblem}}</div>
	<div v-else>Loading...</div>

	<h3 class="mt-3">Games</h3>
	<div v-if="games">
		<div v-if="0 === games.length">No games</div>
		<ul v-else>
			<li v-for="game in games">
				<router-link :to="gameLink(game)">{{game.name || game.id}}</router-link>
			</li>
		</ul>
		<div class="form-group">
			<button type="button" class="btn btn-outline-primary" data-toggle="modal" data-target="#game_modal">Start a new game</button>
		</div>
	</div>
	<div v-else-if="gamesProblem">{{gamesProblem}}</div>
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
						<input id="survey_question" class="form-control" :class="{'is-invalid': questionProblem}" v-model="editQuestion" required="required" aria-describedby="survey_question_problem" />
						<div id="survey_question_problem" class="invalid-feedback" v-show="questionProblem">{{questionProblem}}</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" @click="questionSave($event)" :disabled="questionProblem === 0 || !survey">OK</button>
				</div>
			</div>
		</div>
	</div>

	<div class="modal fade" id="game_modal" tabindex="-1" aria-labelledby="game_title" aria-hidden="true">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h5 class="modal-title" id="game_title">New Game</h5>
					<button type="button" class="close" data-dismiss="modal" aria-label="Close">
						<span aria-hidden="true">&times;</span>
					</button>
				</div>
				<div class="modal-body">
					<div class="form-group">
						<label for="game_name">Game Name</label>
						<input id="game_name" class="form-control" :class="{'is-invalid': gameProblem}" v-model="gameName" required="required" aria-describedby="game_name_problem" />
						<div id="game_name_problem" class="invalid-feedback" v-show="gameProblem">{{gameProblem}}</div>
					</div>
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-primary" @click="gameSave($event)" :disabled="gameProblem === 0">OK</button>
				</div>
			</div>
		</div>
	</div>
</div>`
	}
});