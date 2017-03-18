Vue.component("n-form-section", {
	props: {
		name: {
			type: String,
			required: false
		},
		// a json schema component stating the definition
		schema: {
			type: Object,
			required: false
		}
	},
	data: function() {
		return {
			labels: []
		}
	},
	template: "#n-form-section",
	computed: {
		definition: function() {
			return nabu.utils.vue.form.definition(this);
		},
		mandatory: function() {
			return nabu.utils.vue.form.mandatory(this);
		}
	},
	methods: {
		validate: function() {
			return nabu.utils.vue.form.validateChildren(this);
		}
	},
	events: {
		'$vue.child.added': function(child) {
			if (child.label) {
				// we pass in the entire component because we are interested in the "hide" property it may have
				// if we simply pass in the hide, it doesn't work...
				this.labels.push({ 
					name: child.label,
					component: child
				});
			}
			else if (child.labels) {
				this.labels.splice(0, this.labels.length);
				nabu.utils.arrays.merge(this.labels, child.labels);
			}
			else {
				this.labels.push(null);
			}
		}
	}
});