Vue.directive("action", {
	bind: function(element, binding, vnode) {
		var native = ["click", "hover", "mouseover", "mouseout"];
		
		var handler = function(event) {
			element.setAttribute("disabled", "disabled");
			var result = binding.value(event);
			if (result && result.then) {
				result.then(function() {
					element.removeAttribute("disabled");
				});
			}
			else {
				element.removeAttribute("disabled");
			}
		};
		
		if (!binding.arg || native.indexOf(binding.arg) >= 0) {
			element.addEventListener(binding.arg ? binding.arg : "click", handler);
		}
		else {
			vnode.context.$on(binding.arg, handler);
		}
	}
});