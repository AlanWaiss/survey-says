const apiService = {
	root: '/api',
	loadSurvey: function(groupId, surveyId) {
		return fetchJson(this.root + '/survey/' + encodeURIComponent(groupId) + '/' + encodeURIComponent(surveyId), {
			credentials: 'same-origin'
		});
	},
	saveSurvey: function(survey) {
		var url = this.root + '/survey/' + encodeURIComponent(survey.groupId),
			method = "POST";
		if(survey.id) {
			url += "/" + encodeURIComponent(survey.id);
			method = "PUT";
		}
		return fetchJson(url, {
			method: method,
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify(survey)
		});
	}
};
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

	//var started;
	function startHubAsync() {
		//if("Disconnected" != gameHub.state && started)
		//	return started;

		reconnect.timer = 0;

		return new Promise((resolve, reject) => {
			gameHub.start()
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
/** The routes used by the app */
const routes = [];
const user = {
	id: "",
	name: ""
};
const breadcrumbs = [];

Vue.component('breadcrumb-nav', {
	data: function() {
		breadcrumbs: breadcrumbs
	},
	template: `<nav aria-label="breadcrumb" id="breadcrumb" style="display:none" v-show="breadcrumbs.length > 0">
	<ol class="breadcrumb">
		<li v-for="item in breadcrumbs" class="breadcrumb-item" :class="{'active': item.active}">
			<router-link v-if="item.route" :to="item.route">{{item.text}}</router-link>
			<a v-else-if="item.url" :href="item.url">{{item.text}}</a>
			<span v-else>{{item.text}}</span>
		</li>
	</ol>
</nav>`
})
Vue.component('answer-board', {
	props: {
		answers: Array,
		prefix: {
			default: 'survey_answer_',
			type: String
		}
	},
	template: `<ol class="answer-board list-unstyled">
	<survey-answer v-for="(answer, index) in answers" :answer="answer" :index="index" :prefix="prefix"></survey-answer>
</ol>`
});
Vue.component('survey-answer', {
	props: {
		answer: Object,
		edit: Object,
		index: {
			required: true,
			type: Number
		},
		prefix: {
			default: 'survey_answer_',
			type: String
		}
	},
	computed: {
		scoreId: function() {
			return this.prefix + this.index + '_score';
		},
		textId: function() {
			return this.prefix + this.index + '_text';
		}
	},
	methods: {
		answerClick: function(e) {
			this.$emit('answer-click', {
				$event: e,
				answer: this.answer,
				index: this.index
			});
		},
		answerKeyDown: function(e) {
			this.$emit('answer-keydown', {
				$event: e,
				answer: this.answer,
				index: this.index
			});
		},
		emitEdit: function() {
			this.$emit('answer-edit', {
				$event: e,
				answer: this.answer,
				index: this.index,
				edit: this.edit
			});
		},
		scoreBlur: function(e) {
			this.answer.score = parseFloat(this.edit.score, 10) || (this.edit.score = this.edit.$o.score);
			this.emitEdit();
		},
		textBlur: function(e) {
			this.answer.text = this.edit.text.trim() || (this.edit.text = this.edit.$o.text);
			this.emitEdit();
		}
	},
	template: `<li class="survey-answer" :id="prefix + index" @click="answerClick($event)" @keydown="answerKeyDown($event)">
	<div v-if="edit" class="survey-answer-edit form-row">
		<div class="col-sm">
			<label :for="textId">Text</label>
			<input type="text" :id="textId" class="form-control" v-model="edit.text" @blur="textBlur($event)" required />
		</div>
		<div class="col-sm-auto">
			<label :for="scoreId">Score</label>
			<input type="text" :id="scoreId" class="form-control" inputmode="numeric" placeholder="Score" v-model.number="edit.score" @blur="scoreBlur($event)" required />
		</div>
	</div>
	<div v-else-if="answer" class="survey-answer-show">
		<div class="survey-answer-text">{{answer.text}}</div>
		<div class="survey-answer-score">{{answer.score}}</div>
		<slot></slot>
	</div>
	<div v-else class="survey-answer-hide">
		<div class="survey-answer-index badge badge-pill badge-secondary">{{index + 1}}</div>
	</div>
</li>`
});
Vue.component('survey-board', {
	props: {
		answers: Array,
		prefix: {
			default: 'survey_answer_',
			type: String
		},
		selected: Array
	},
	methods: {
		answerClick: function(e) {
			this.$emit('answer-click', e);
		},
		isSelected: function(answer) {
			var selected = this.selected;
			if(!selected)
				return false;

			return selected.find(a => a && a.text == answer.text);
		}
	},
	template: `<ol class="survey-board list-unstyled">
	<survey-answer v-for="(answer, index) in answers" :answer="answer" :index="index" :class="{'survey-answer-selected': isSelected(answer)}" @answer-click="answerClick($event)" :prefix="prefix"></survey-answer>
</ol>`
});
Vue.component('sign-in', {
	data: function() {
		var vm = {
			name: localStorage.getItem("user:name")
		};
		vm.edit = !vm.name;
		return vm;
	},
	methods: {
		ok: function() {
			if(this.name) {
				localStorage.setItem("user:name", this.name);
				this.$emit('sign-in', {
					name: this.name
				});
				this.edit = false;
			}
		}
	},
	template: `<div>
	<div v-if="edit">
		<div class="form-group">
			<label for="user_name">Name</label>
			<input type="text" class="form-control" id="user_name" v-model.trim="name" required aria-describedby="user_name_help" />
			<small class="form-text text-muted" id="user_name_help">Your name will appear to the other players</small>
		</div>
		<button type="button" class="btn btn-primary" :disabled="!name" @click="ok">OK</button>
	</div>
	<div v-else>
		<p class="lead">Welcome {{name}}</p>
		<button type="button" class="btn btn-link" @click="edit = true">Not {{name}}?</button>
	</div>
</div>`
});
const hostRoutes = [];

routes.push({
	path: '/host',
	component: {
		template: `<div>
	<router-view></router-view>
</div>`
	},
	children: hostRoutes
});
hostRoutes.push({
	path: '',
	component: {
		data: function() {
			return {
				games: [
					{
						id: "0ea9b217-a82a-43ea-9727-93adee35795f",
						groupId: "tms",
						question: "What is your favorite Christmas movie?",
						surveyId: "68f399cb-2daf-4c3a-a0e0-6b9fb8a7dd8b"
					}
				]
			}
		},
		methods: {
			gameUrl: game => "/host/" + encodeURIComponent(game.groupId) + "/" + encodeURIComponent(game.surveyId) + "/" + encodeURIComponent(game.id)
		},
		template: `<ul>
	<li v-for="game in games"><router-link :to="gameUrl(game)">{{game.question}}</router-link></li>
</ul>`
	}
});
hostRoutes.push({
	path: ':groupId',
	component: {
		data: function() {
			return {
				groupId: null,
				group: null,
				groupProblem: null
			};
		},
		methods: {
		},
		template: `<div class="container">
	<h2>Group</h2>
	<div v-if="group"></div>
	<div v-else-if="groupProblem">{{groupProblem}}</div>
	<div v-else>This is not yet implemented</div>
</div>`
	}
});
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
				currentAnswer: null,
				editAnswer: null,
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
				if(this.survey)
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
			loadSurvey: function(groupId, surveyId) {
				var t = this;
				if(groupId == t.groupId && surveyId == t.surveyId)
					return;
				t.survey = null;
				apiService.loadSurvey(t.groupId = groupId, t.surveyId = surveyId)
					.then(survey => {
						t.survey = survey;
						t.currentAnswer = survey.answers[0];
					}, problem => t.surveyProblem = problem || "Invalid survey");
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
hostRoutes.push({
	path: ':groupId/:surveyId/:gameId',
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
						text: "Survey",
						route: route += "/" + encodeURIComponent(to.params.surveyId)
					},
					{
						active: true,
						text: "Game"
					}];
			breadcrumbs.splice.apply(breadcrumbs, bc);
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
				if(groupId == t.groupId && surveyId == t.surveyId)
					return;
				t.survey = null;
				apiService.loadSurvey(t.groupId = groupId, t.surveyId = surveyId)
					.then(survey => t.survey = survey, problem => t.surveyProblem = problem || "Invalid survey");
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
				</div>
			</div>
			<div v-else class="card-body">Loading...</div>
			<div class="card-footer">This is how the game currently appears to players</div>
		</div>
	</div>
</div>`
	}
});
const Index = {
	template: `<div class="row align-items-center">
	<sign-in class="col-sm"></sign-in>
	<div class="col-sm">
		<router-link to="play" class="btn btn-outline-secondary btn-block btn-lg">Play</router-link>
		<a href="/host" class="btn btn-outline-secondary btn-block btn-lg">Host</a>
	</div>
</div>`
}
routes.push({
	path: '/:room',
	component: Index
}, {
	path: '/',
	component: Index
});
const router = new VueRouter({
	mode: 'history',
	routes: routes
});
const app = new Vue({
	router
}).$mount('#app');