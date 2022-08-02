// the argument should be the name of the route, any value is passed in as parameters
// the modifier is interpreted as the anchor to route it to
Vue.directive("content", function(element, binding, vnode) {
	var content = binding.value;
	var keys = null;
	if (binding.modifiers) {
		keys = Object.keys(binding.modifiers);
	}
	// always clear the element
	nabu.utils.elements.clear(element);
	
	var rewriteLinks = function() {
		if (application && application.services && application.services.router) {
			var results = element.querySelectorAll("a");
			var addListener = function(href) {
				return function(event) {
					var route = application.services.router.router.findRoute(href, false);
					if (route) {
						application.services.router.route(route.route.alias, route.parameters);
					}
					event.stopPropagation();
					event.preventDefault();	
				}
			}
			// rewrite links in this page to click handlers
			for (var i = 0; i < results.length; i++) {
				var href = results.item(i).getAttribute("href");
				if (href && href.indexOf("/") == 0) {
					results.item(i).addEventListener("click", addListener(href));
				}
			}
		}
	};

	if (content != null && typeof(content) != "undefined") {
		var parameters = {};
		if (keys && keys.indexOf("parameterized") >= 0) {
			parameters = content;
			content = content.value;
		}
		if (content != null && typeof(content) != "undefined") {
			// we interpret this as plain string data, that means making sure everything is escaped and whitespace is adhered to
			if ((keys && keys.indexOf("plain") >= 0) || parameters.plain) {
				if (typeof(content) != "string") {
					if (content.innerHTML) {
						content = content.innerHTML;
					}
					else {
						content = "" + content;
					}
				}
				content = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
				.replace(/\n/g, "<br/>").replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;");
				// breaks default wrapping..
				//.replace(/ /g, "&nbsp;");
			}
			// the sanitize routine sends back "element.innerHTML" by default if you pass it a string
			// however, if that string started out with a raw ampersand (e.g. "test&test")
			// the sanitize will do nothing except basically element.innerHTML = "test&test"; return element.innerHTML;
			// that single action will however change the content into "test&amp;test" to make it HTML-compatible
			// if we combine this with the "plain" encoding, we get double-encoded ampersands
			// in theory the plain encoding already prevents injection and is very unlikely to be needed in combination with an actual sanitize routine which selectively removes html elements/attrs
			else if ((keys && keys.indexOf("sanitize") >= 0) || parameters.sanitize) {
				content = nabu.utils.elements.sanitize(content);
			}
			if (typeof(content) == "string" && content.match(/^[ \t]+$/)) {
				element.innerHTML = content;
			}
			else if ((keys && keys.indexOf("compile") >= 0) || parameters.compile) {
				var context = {};
				Object.keys(vnode.context.$props).map(function(key) {
					if (typeof(vnode.context.$props[key]) !== "undefined") {
						context[key] = vnode.context.$props[key];
					}
				});
				// data overwrites props if necessary
				Object.keys(vnode.context.$data).map(function(key) {
					if (typeof(vnode.context.$data[key]) !== "undefined") {
						context[key] = vnode.context.$data[key];
					}
				});
				var component = Vue.extend({
					data: function() {
						return context;
					},
					template: "<div>" + (typeof(content) == "string" ? content : content.innerHTML) + "</div>" 
				});
				content = new component();
				content.$mount();
				
				var insertBefore = null;
				for (var i = content.$el.childNodes.length - 1; i >= 0; i--) {
					if (insertBefore == null) {
						insertBefore = element.appendChild(content.$el.childNodes[i]);
					}
					else {
						insertBefore = element.insertBefore(content.$el.childNodes[i], insertBefore);
					}
				}
				rewriteLinks();
			}
			else if (content instanceof HTMLElement) {
				element.appendChild(content);
				rewriteLinks();
			}
			else {
				element.innerHTML = content;
				rewriteLinks();
			}
		}
	}
});

