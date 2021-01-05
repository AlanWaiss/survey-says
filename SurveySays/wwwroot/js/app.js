function fetchJson(url, options) {
	return fetch(url, options)
		.then(response => {
			if(!response.ok) {
				console.error("Invalid response", response);
				throw new Error(404 == response.status ? "Not found" : "Invalid response");
			}
			return response.json();
		});
}
const apiService = {
	root: '/api',
	appendParams: function(url, params) {
		if(params) {
			for(let keys = Object.getOwnPropertyNames(params), len = keys.length, i = 0, first = url.indexOf('?') == -1; i < len; i++) {
				if(first) {
					url += '?';
					first = false;
				}
				else
					url += '&';
				url += encodeURIComponent(keys[i]);
				url += '=';
				url += encodeURIComponent(params[keys[i]]);
			}
		}
		return url;
	},
	loadGames: function(groupId, params) {
		return fetchJson(this.appendParams(this.root + '/game/' + encodeURIComponent(groupId), params), {
			credentials: 'same-origin'
		});
	},
	loadGroup: function(lang, groupId) {
		var request = fetchJson(this.root + '/group/' + encodeURIComponent(lang) + '/' + encodeURIComponent(groupId), {
			credentials: 'same-origin'
		});
		request.then(group => {
			cache.groupName(groupId, group.name);
			cache.save();
		})
		return request;
	},
	loadGroups: function(lang) {
		var request = fetchJson(this.root + '/group/' + encodeURIComponent(lang || "en"), {
			credentials: 'same-origin'
		});
		request.then(groups => {
			groups.forEach(group => cache.groupName(group.id, group.name));
			cache.save();
		})
		return request;
	},
	loadSurvey: function(groupId, surveyId) {
		return fetchJson(this.root + '/survey/' + encodeURIComponent(groupId) + '/' + encodeURIComponent(surveyId), {
			credentials: 'same-origin'
		});
	},
	loadSurveys: function(groupId, params) {
		return fetchJson(this.appendParams(this.root + '/survey/' + encodeURIComponent(groupId), params), {
			credentials: 'same-origin'
		});
	},
	saveGame: function(game) {
		var url = this.root + '/game/' + encodeURIComponent(game.groupId),
			method = "POST";
		if(game.id) {
			url += "/" + encodeURIComponent(game.id);
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
			body: JSON.stringify(game)
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
const cache = {
	_groupName: {},
	groupName: function(id, name) {
		/*if(id && !name && "object" === typeof id) {
			name = id.name;
			id = id.id;
		}*/
		if(name) {
			this._groupName[(id || "").toLowerCase()] = name;
			return this;
		}

		return this._groupName[(id || "").toLowerCase()];
	},
	save: function() {
		var groupName = this._groupName;
		localStorage.setItem("cache.groupname", JSON.stringify(groupName));
	}
};

(function() {
	var groupName = localStorage.getItem("cache.groupname");
	if(groupName)
		cache._groupName = JSON.parse(groupName);
})();
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
/** The routes used by the app */
const routes = [];
const breadcrumbs = [];

function buildRoute() {
	var t = this;
	if(!(t && t instanceof buildRoute))
		return new buildRoute();

	t.path = [];
	t.route = "";
}
$.extend(buildRoute.prototype, {
	add: function(item) {
		if("string" == typeof item)
			item = {
				text: item
			};
		this.route = item.route || item.url || this.route;
		this.path.push(this.active = item);
		return this;
	},
	addHome: function(text) {
		//Do NOT use this.add
		this.path.push(this.active = {
			text: text || "Home",
			route: "/"
		});
		return this;
	},
	addRoute: function(text, routeComponent) {
		return this.add({
			text: text,
			route: this.route + "/" + encodeURIComponent(routeComponent)
		});
	},
	addUrl: function(text, urlComponent) {
		return this.add({
			text: text,
			url: this.route + "/" + encodeURIComponent(urlComponent)
		});
	},
	apply: function() {
		breadcrumbs.splice.apply(breadcrumbs, [0, breadcrumbs.length].concat(this.path));
		return this;
	},
	peek: function() {
		return this.active;
	}
});

Vue.component('breadcrumb-nav', {
	data: function() {
		return {
			items: breadcrumbs
		};
	},
	template: `<nav aria-label="breadcrumb" id="breadcrumb" style="display:none" v-show="items.length > 0">
	<ol class="breadcrumb">
		<li v-for="item in items" class="breadcrumb-item" :class="{'active': !(item.route || item.url)}">
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
	<transition name="board-transition">
		<div v-if="edit" key="edit" class="survey-answer-edit form-row">
			<div class="col-sm">
				<label :for="textId">Text</label>
				<input type="text" :id="textId" class="form-control" v-model="edit.text" @blur="textBlur($event)" required />
			</div>
			<div class="col-sm-auto">
				<label :for="scoreId">Score</label>
				<input type="text" :id="scoreId" class="form-control" inputmode="numeric" placeholder="Score" v-model.number="edit.score" @blur="scoreBlur($event)" required />
			</div>
		</div>
		<div v-else-if="answer" key="show" class="survey-answer-show">
			<div class="survey-answer-text">{{answer.text}}</div>
			<div class="survey-answer-score">{{answer.score}}</div>
			<slot></slot>
		</div>
		<div v-else key="hide" class="survey-answer-hide">
			<div class="survey-answer-index badge badge-pill badge-secondary">{{index + 1}}</div>
		</div>
	</transition
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
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.loadData(to.query.lang));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.loadData(to.query.lang);
			next();
		},
		data: function() {
			return {
				groups: null,
				groupsProblem: null
			}
		},
		methods: {
			groupUrl: group => "/host/" + encodeURIComponent(group.id),
			loadData: function(lang) {
				var t = this;
				t.bc = buildRoute()
					.addHome("Host")
					.add("Groups", "play")
					.apply();
				apiService.loadGroups(lang)
					.then(groups => t.groups = groups, problem => t.groupsProblem = problem || "There was a problem loading the groups.")
			}
		},
		template: `<div class="container">
	<h2>Groups</h2>
	<ul v-if="groups">
		<li v-for="group in groups"><router-link :to="groupUrl(group)">{{group.name}}</router-link></li>
	</ul>
	<div v-else-if="groupsProblem" class="alert alert-danger">{{groupsProblem}}</div>
	<div v-else>Loading...</div>
</div>`
	}
});
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
					.addHome("Host")
					.addRoute("Groups", "host")
					.add(cache.groupName(groupId) || groupId)
					.apply();

				t.groupProblem = t.gamesProblem = t.surveysProblem = null;

				apiService.loadGroup("en", t.groupId = groupId)
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
					.addHome("Host")
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
hostRoutes.push({
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
const playRoutes = [];

routes.push({
	path: '/play',
	component: {
		template: `<div>
	<router-view></router-view>
</div>`
	},
	children: playRoutes
});
playRoutes.push({
	path: '',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.loadData(to.query.lang));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.loadData(to.query.lang);
			next();
		},
		data: function() {
			return {
				groups: null,
				groupsProblem: null
			}
		},
		methods: {
			groupUrl: group => "/play/" + encodeURIComponent(group.id),
			loadData: function(lang) {
				var t = this;
				t.bc = buildRoute()
					.addHome("Play")
					.add("Groups", "play")
					.apply();
				apiService.loadGroups(lang)
					.then(groups => t.groups = groups, problem => t.groupsProblem = problem || "There was a problem loading the groups.")
			}
		},
		template: `<div class="container">
	<h2>Groups</h2>
	<ul v-if="groups">
		<li v-for="group in groups"><router-link :to="groupUrl(group)">{{group.name}}</router-link></li>
	</ul>
	<div v-else-if="groupsProblem" class="alert alert-danger">{{groupsProblem}}</div>
	<div v-else>Loading...</div>
</div>`
	}
})
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
routes.push({
	path: '',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.loadData(to.query.lang));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.loadData(to.query.lang);
			next();
		},
		data: function() {
			return {};
		},
		methods: {
			loadData: function(lang) {
				var t = this;
				t.bc = buildRoute()
					.add("Home")
					.apply();
			}
		},
		template: `<div class="container pt-3">
	<router-link to="play" class="btn btn-outline-secondary btn-block btn-lg">Play</router-link>
	<a href="/host" class="btn btn-outline-secondary btn-block btn-lg">Host</a>
</div>`/*
	<div class="row align-items-center">
		<sign-in class="col-sm"></sign-in>
		<div class="col-sm">
		--links
		</div>
	</div>*/
	}
});
const router = new VueRouter({
	mode: 'history',
	routes: routes
});
const app = new Vue({
	router
}).$mount('#app');