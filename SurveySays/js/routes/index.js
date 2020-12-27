const Index = {
	template: `<div class="row align-items-center">
	<sign-in class="col-sm"></sign-in>
	<div class="col-sm">
		<router-link to="play" class="btn btn-outline-secondary btn-block btn-lg">Play</router-link>
		<router-link to="host" class="btn btn-outline-secondary btn-block btn-lg">Host</router-link>
	</div>
</div>`
}
routes.push({
	path: '/:room',
	component: Index
}, {
	path: '/',
	component: Index
});