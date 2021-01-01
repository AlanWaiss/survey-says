hostRoutes.push({
	path: '',
	component: {
		data: function() {
			return {
				games: [
					{
						id: "0ea9b217-a82a-43ea-9727-93adee35795f",
						groupId: "tms",
						question: "What is your favorite Christmas movie?",
						surveyId: "68f399cb-2daf-4c3a-a0e0-6b9fb8a7dd8b"
					}
				]
			}
		},
		methods: {
			gameUrl: game => "/host/" + encodeURIComponent(game.groupId) + "/" + encodeURIComponent(game.surveyId) + "/" + encodeURIComponent(game.id)
		},
		template: `<ul>
	<li v-for="game in games"><router-link :to="gameUrl(game)">{{game.question}}</router-link></li>
</ul>`
	}
});