const breadcrumbs = [];

function buildRoute() {
	var t = this;
	if(!(t && t instanceof buildRoute))
		return new buildRoute();

	t.path = [];
	t.route = "";
}
$.extend(buildRoute.prototype, {
	add: function(item) {
		if("string" == typeof item)
			item = {
				text: item
			};
		this.route = item.route || item.url || this.route;
		this.path.push(this.active = item);
		return this;
	},
	addRoute: function(text, routeComponent) {
		return this.add({
			text: text,
			route: this.route + "/" + encodeURIComponent(routeComponent)
		});
	},
	addUrl: function(text, urlComponent) {
		return this.add({
			text: text,
			url: this.route + "/" + encodeURIComponent(urlComponent)
		});
	},
	apply: function() {
		breadcrumbs.splice.apply(breadcrumbs, [0, breadcrumbs.length].concat(this.path));
		return this;
	},
	peek: function() {
		return this.active;
	}
});

Vue.component('breadcrumb-nav', {
	data: function() {
		return {
			items: breadcrumbs
		};
	},
	template: `<nav aria-label="breadcrumb" id="breadcrumb" style="display:none" v-show="items.length > 0">
	<ol class="breadcrumb">
		<li v-for="item in items" class="breadcrumb-item" :class="{'active': !(item.route || item.url)}">
			<router-link v-if="item.route" :to="item.route">{{item.text}}</router-link>
			<a v-else-if="item.url" :href="item.url">{{item.text}}</a>
			<span v-else>{{item.text}}</span>
		</li>
	</ol>
</nav>`
})