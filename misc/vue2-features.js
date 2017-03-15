Vue.mixin({
	methods: {
		// re-add the $appendTo, the router depends on it
		$appendTo: function(element) {
			element.appendChild(this.$el);
		},
		$dispatch: function(event) {
			var args = [];
			for (var i = 1; i < arguments.length; i++) {
				args.push(arguments[i]);
			}
			var call = function(context) {
				if (context.$options.events) {
					var names = Object.keys(content.$options.events);
					for (var i = 0; i < names.length; i++) {
						if (event == names[i]) {
							var result = content.$options.events[names[i]].apply(context, args);
							// if the method returns "true", we need to keep going deeper
							if (result !== true) {
								return true;
							}
							break;
						}
					}
					if (context.$parent) {
						call(context.$parent);
					}
				}
				return false;
			}
			call(this);
		}
	},
	// re-add the ready lifecycle state
	mounted: function() {
		if (this.$options.ready) {
			var self = this;
			this.$nextTick(function () {
				self.$options.ready.call(self);
			});
		}
	}
});