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
		<div class="survey-answer-index badge badge-pill badge-secondary">{{index + 1}}</div>
	</div>
</li>`
});