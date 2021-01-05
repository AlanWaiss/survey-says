const cache = {
	_groupName: {},
	groupName: function(id, name) {
		/*if(id && !name && "object" === typeof id) {
			name = id.name;
			id = id.id;
		}*/
		if(name) {
			this._groupName[(id || "").toLowerCase()] = name;
			return this;
		}

		return this._groupName[(id || "").toLowerCase()];
	},
	save: function() {
		var groupName = this._groupName;
		localStorage.setItem("cache.groupname", JSON.stringify(groupName));
	}
};

(function() {
	var groupName = localStorage.getItem("cache.groupname");
	if(groupName)
		cache._groupName = JSON.parse(groupName);
})();