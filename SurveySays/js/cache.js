const cache = {
	groups: {},
	save: function() {
		var groups = this.groups;
		localStorage.setItem("cache.groups", JSON.stringify(groups));
	}
}

(function() {
	var groups = localStorage.getItem("cache.groups");
	if(groups)
		cache.groups = JSON.parse(groups);
})();