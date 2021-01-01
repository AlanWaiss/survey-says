hostRoutes.push({
	path: ':groupId',
	component: {
		data: function() {
			return {
				groupId: null,
				group: null,
				groupProblem: null
			};
		},
		methods: {
		},
		template: `<div class="container">
	<h2>Group</h2>
	<div v-if="group"></div>
	<div v-else-if="groupProblem">{{groupProblem}}</div>
	<div v-else>This is not yet implemented</div>
</div>`
	}
});