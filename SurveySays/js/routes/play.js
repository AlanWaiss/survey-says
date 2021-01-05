const playRoutes = [];

routes.push({
	path: '/play',
	component: {
		template: `<div>
	<router-view></router-view>
</div>`
	},
	children: playRoutes
});