const breadcrumbs = [];

Vue.component('breadcrumb-nav', {
	data: function() {
		return {
			items: breadcrumbs
		};
	},
	template: `<nav aria-label="breadcrumb" id="breadcrumb" style="display:none" v-show="items.length > 0">
	<ol class="breadcrumb">
		<li v-for="item in items" class="breadcrumb-item" :class="{'active': item.active}">
			<router-link v-if="item.route" :to="item.route">{{item.text}}</router-link>
			<a v-else-if="item.url" :href="item.url">{{item.text}}</a>
			<span v-else>{{item.text}}</span>
		</li>
	</ol>
</nav>`
})