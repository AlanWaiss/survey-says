const hostRoutes = [];

routes.push({
	path: '/host',
	component: {
		template: `<div>
	<router-view></router-view>
</div>`
	},
	children: hostRoutes
});