playRoutes.push({
	path: '',
	component: {
		beforeRouteEnter: function(to, from, next) {
			next(vm => vm.loadData(to.query.lang));
		},
		beforeRouteUpdate: function(to, from, next) {
			this.loadData(to.query.lang);
			next();
		},
		data: function() {
			return {
				groups: null,
				groupsProblem: null
			}
		},
		methods: {
			groupUrl: group => "/play/" + encodeURIComponent(group.id),
			loadData: function(lang) {
				var t = this;
				t.bc = buildRoute()
					.add("Groups", "play")
					.apply();
				apiService.loadGroups(lang)
					.then(groups => t.groups = groups, problem => t.groupsProblem = problem || "There was a problem loading the groups.")
			}
		},
		template: `<div class="container">
	<h2>Groups</h2>
	<ul v-if="groups">
		<li v-for="group in groups"><router-link :to="groupUrl(group)">{{group.name}}</router-link></li>
	</ul>
	<div v-else-if="groupsProblem" class="alert alert-danger">{{groupsProblem}}</div>
	<div v-else>Loading...</div>
</div>`
	}
})