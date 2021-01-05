//Audio file source: https://www.101soundboards.com/boards/29446-family-feud
const audioService = {
	state: {
		muted: false
	},
	_checkAnswers: function(oldList, newList) {
		for(var i = 0, len = Math.min(oldList.length, newList.length); i < len; i++) {
			if(newList[i] && !oldList[i])
				return true;
		}
		return false;
	},
	gameUpdate: function(oldState, newState) {
		if(this.muted || !oldState || !newState)
			return;
		if(newState.strikes > oldState.strikes)
			this.playStrike();
		else if(this._checkAnswers(oldState.answers, newState.answers))
			this.playCorrect();
	},
	playCorrect: function() {
		if(!this.state.muted)
			document.getElementById('audio_correct').play();
	},
	playStrike: function() {
		if(!this.state.muted)
			document.getElementById('audio_strike').play();
	},
	saveState: function() {
		localStorage.setItem("audio.state", JSON.stringify(this.state));
	}
};

(function() {
	var state = localStorage.getItem('audio.state');
	if(state)
		$.extend(audioService.state, JSON.parse(state));

	audioService.display = new Vue({
		el: '#audio_display',
		data: audioService.state,
		computed: {
			icon: function() {
				return this.muted ? 'fa-volume-mute btn-outline-secondary' : 'fa-volume-up btn-outline-primary';
			},
			text: function() {
				return this.muted ? 'Muted' : 'Unmuted';
			}
		},
		methods: {
			click: function(event) {
				this.muted = !this.muted;
				audioService.saveState();
			}
		},
	});
})();