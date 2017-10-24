Vue.directive("route-render", {
	// the argument should be the name of the route, any value is passed in as parameters
	// the modifier is interpreted as the anchor to route it to
	bind: function(element, binding, vnode) {
		var parameters = {
			alias: binding.arg ? binding.arg : binding.value.alias,
			parameters: binding.arg ? binding.value : binding.value.parameters
		}
		var result = vnode.context.$services.router.route(parameters.alias, parameters.parameters, element, true);
		if (result && result.then) {
			result.then(function(component) {
				element["n-route-component"] = component;
			});
		}
		element["n-route-render-route-json"] = JSON.stringify(parameters);
		element["n-route-render-route"] = parameters;
	},
	update: function(element, binding, vnode) {
		var parameters = {
			alias: binding.arg ? binding.arg : binding.value.alias,
			parameters: binding.arg ? binding.value : binding.value.parameters
		}
		
		var isExactCopy = element["n-route-render-route-json"] == JSON.stringify(parameters);
		
		if (!isExactCopy) {
			element["n-route-render-route-json"] = JSON.stringify(parameters);
			
			var isSameAlias = element["n-route-render-route"]
				&& element["n-route-render-route"].alias == parameters.alias;
			
			var isSame = isSameAlias
				&& element["n-route-render-route"].parameters == parameters.parameters;
			
			if (!isSame) {
				element["n-route-render-route"] = parameters;
				
				if (!isSameAlias) {
					var result = vnode.context.$services.router.route(parameters.alias, parameters.parameters, element, true);
					if (result && result.then) {
						result.then(function(component) {
							element["n-route-component"] = component;
						});
					}
				}
			}
		}
	}
});