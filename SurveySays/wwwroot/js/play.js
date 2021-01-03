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
	loadGroup: function(groupId) {
		return fetchJson(this.root + '/group/' + encodeURIComponent(groupId), {
			credentials: 'same-origin'
		});
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
routes.push({
	path: '/play/:groupId/:gameId',
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
				var t = this,
					route = "/play",
					bc = [0, breadcrumbs.length,
						{
							text: "Home",
							route: "/"
						},
						{
							text: "Play",
							route: route
						},
						{
							text: groupId,
							route: route += "/" + encodeURIComponent(groupId)
						},
						{
							active: true,
							text: "Game"
						}];

				breadcrumbs.splice.apply(breadcrumbs, bc);

				t.disconnect();
				gameHub.on("gameUpdate", this.c_gameUpdate = (game => {
					t.game = game;
					if(game.name)
						bc[bc.length - 1].text = game.name;
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