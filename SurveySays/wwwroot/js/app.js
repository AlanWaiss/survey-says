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
Vue.component('answer-board', {
	props: ['answers'],
	template: `<ol class="answer-board list-unstyled">
	<survey-answer v-for="(answer, index) in answers" :answer="answer" :index="index"></survey-answer>
</ol>`
});
Vue.component('survey-answer', {
	props: ['answer', 'index'],
	methods: {
		answerClick: function(e) {
			this.$emit('answer-click', {
				$event: e,
				answer: this.answer,
				index: this.index
			});
		}
	},
	template: `<li class="survey-answer" @click="answerClick($event)">
	<div v-if="answer" class="survey-answer-show">
		<div class="survey-answer-text">{{answer.text}}</div>
		<div class="survey-answer-score">{{answer.score}}</div>
	</div>
	<div v-else class="survey-answer-hide">
		<div class="survey-answer-index">{{index + 1}}</div>
	</div>
</li>`
});
Vue.component('survey-board', {
	props: ['answers', 'selected'],
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
	<survey-answer v-for="(answer, index) in answers" :answer="answer" :index="index" :class="{'survey-answer-selected': isSelected(answer)}" @answer-click="answerClick($event)"></survey-answer>
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
		template: `<div>
	<h2>Survey</h2>
	<div v-if="survey">
		<div class="game">
			<p class="lead">{{survey.question}}</p>
			<survey-board :answers="survey.answers" :selected="game && game.answers" @answer-click="answerClick($event)"></survey-board>
		</div>
	</div>
	<div v-else>Loading...</div>
	<p>Link to play: <a :href="gameUrl">{{gameUrl}}</a></p>
	<div v-if="game">
		<h2>{{ game.name }}</h2>
		<p>This is how {{ game.name }} currently appears to players:</p>
		<div class="game">
			<p class="lead">{{game.question}}</p>
			<answer-board :answers="game.answers"></answer-board>
		</div>
	</div>
	<div v-else>Loading...</div>
</div>`
	}
});
routes.push({
	path: '/play/:groupId/:gameId',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.connect(to.params.groupId, to.params.gameId));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.disconnect();
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
			}
		},
		template: `<div>
	<div v-if="game" class="game">
		<p class="lead">{{game.question}}</p>
		<answer-board :answers="game.answers"></answer-board>
	</div>
	<div v-else>Loading...</div>
	<div>Ready to play game {{ $route.params.gameId }}</div>
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