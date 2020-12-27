const Play = {
	template: `<div>Ready to play in room {{ $route.params.room }}</div>`
};

routes.push({
	path: '/play',
	component: Play
}, {
	path: '/:room/play',
	component: Play
});