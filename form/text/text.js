Vue.component("n-form-text", {
	props: {
		value: {
			required: true
		},
		required: {
			type: Boolean,
			required: false
		},
		name: {
			type: String,
			required: false
		},
		// a json schema component stating the definition
		schema: {
			type: Object,
			required: false
		},
		pattern: {
			type: String,
			required: false
		},
		minLength: {
			type: Number,
			required: false
		},
		maxLength: {
			type: Number,
			required: false
		}
	},
	template: "#n-form-text",
	data: function() {
		return {};
	},
	ready: function() {
		// check if we can find the definition in the parent component
		if (!this.schema && this.name && this.$parent && this.$parent.schema && this.$parent.schema.properties) {
			this.schema = this.$parent.schema.properties[this.name];
			if (typeof(this.required) == "undefined") {
				this.required = this.$parent.schema.required && this.$parent.schema.required.indexOf(this.name) >= 0;
			}
		}
		console.log("CHECKING Parent", this.$parent.schema, this.name, this.schema);
	},
	computed: {
		definition: function() {
			// take the original schema (if any)
			var schema = this.schema ? nabu.utils.objects.clone(this.schema) : null;
			// check if we can find the definition in the parent component
			if (!schema && this.name && this.$parent && this.$parent.schema && this.$parent.schema.properties) {
				schema = this.$parent.schema.properties[this.name];
			}
			// bind in the additional keys
			var keys = ["minLength", "maxLength", "pattern"];
			for (var i = 0; i < keys.length; i++) {
				if (typeof(this[keys[i]]) != "undefined") {
					schema[keys[i]] = this[keys[i]];
				}
			}
			console.log("SCHEMA IS", schema);
			return schema;
		},
		mandatory: function() {
			var required = this.required;
			if (typeof(required) == "undefined" && this.name && this.$parent && this.$parent.schema && this.$parent.schema.required) {
				required = this.$parent.schema.required && this.$parent.schema.required.indexOf(this.name) >= 0;
			}
			else {
				required = false;
			}
			return required;
		}
	},
	methods: {
		validate: function() {
			var messages = nabu.utils.schema.json.validate(this.definition, this.value, this.mandatory);
			for (var i = 0; i < messages.length; i++) {
				messages[i].component = this;
			}
			return messages;
		}, 
		updateValue: function() {
			this.$emit("input", this.value);
		}
	}
});