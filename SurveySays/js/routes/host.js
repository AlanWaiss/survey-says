const Host = {
	template: `<div>Ready to host in room {{ $route.params.room }}</div>`
};

routes.push({
	path: '/host',
	component: Host
}, {
	path: '/:room/host',
	component: Host
});