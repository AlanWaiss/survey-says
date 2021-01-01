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