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