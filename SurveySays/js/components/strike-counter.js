Vue.component('strike-counter', {
	props: {
		strikes: Number
	},
	template: `<transition-group name="strike" tag="div" class="strike-counter">
	<span v-for="strike in strikes" :key="strike" class="strike fas fa-times"></span>
</transition-group>`
})