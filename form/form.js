Vue.component("n-form", {
	props: {
		// a json schema component stating the definition
		schema: {
			type: Object,
			required: false
		}
	},
	template: "#n-form",
	methods: {
		validate: function() {
			var messages = [];
			for (var i = 0; i < this.$children.length; i++) {
				if (this.$children[i].validate) {
					var childMessages = this.$children[i].validate();
					nabu.utils.arrays.merge(messages, childMessages);
				}
			}
			return messages;
		}
	}
});