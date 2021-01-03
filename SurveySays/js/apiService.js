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