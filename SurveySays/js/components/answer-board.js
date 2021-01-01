Vue.component('answer-board', {
	props: ['answers'],
	template: `<ol class="answer-board list-unstyled">
	<survey-answer v-for="(answer, index) in answers" :answer="answer" :index="index"></survey-answer>
</ol>`
});