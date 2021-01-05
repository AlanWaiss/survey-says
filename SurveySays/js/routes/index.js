routes.push({
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
			return {};
		},
		methods: {
			loadData: function(lang) {
				var t = this;
				t.bc = buildRoute()
					.add("Home")
					.apply();
			}
		},
		template: `<div class="container pt-3">
	<router-link to="play" class="btn btn-outline-secondary btn-block btn-lg">Play</router-link>
	<a href="/host" class="btn btn-outline-secondary btn-block btn-lg">Host</a>
</div>`/*
	<div class="row align-items-center">
		<sign-in class="col-sm"></sign-in>
		<div class="col-sm">
		--links
		</div>
	</div>*/
	}
});