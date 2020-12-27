Vue.component('sign-in', {
	data: function() {
		var vm = {
			name: localStorage.getItem("user:name")
		};
		vm.edit = !vm.name;
		return vm;
	},
	methods: {
		ok: function() {
			if(this.name) {
				localStorage.setItem("user:name", this.name);
				this.$emit('sign-in', {
					name: this.name
				});
				this.edit = false;
			}
		}
	},
	template: `<div>
	<div v-if="edit">
		<div class="form-group">
			<label for="user_name">Name</label>
			<input type="text" class="form-control" id="user_name" v-model.trim="name" required aria-describedby="user_name_help" />
			<small class="form-text text-muted" id="user_name_help">Your name will appear to the other players</small>
		</div>
		<button type="button" class="btn btn-primary" :disabled="!name" @click="ok">OK</button>
	</div>
	<div v-else>
		<p class="lead">Welcome {{name}}</p>
		<button type="button" class="btn btn-link" @click="edit = true">Not {{name}}?</button>
	</div>
</div>`
});