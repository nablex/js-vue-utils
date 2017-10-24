if (!nabu) { var nabu = {}; }
if (!nabu.services) { nabu.services = {}; }

nabu.services.VueService = function(component, parameters) {
	component.render = function(done) {
		// do nothing, a service has no DOM presence
		return done();
	}
	
	var service = function($services) {
		var activate = function(instance) {
			if (instance.$options && instance.$options.activate) {
				if (instance.$options.activate instanceof Array) {
					var promises = [];
					var resultingService = null;
					var process = function(activation) {
						var promise = $services.q.defer();
						promises.push(promise);
						var done = function(result) {
							promise.resolve(result);
							if (result) {
								resultingService = result;
							}
						};
						activation.call(instance, done);
					}
					for (var i = 0; i < instance.$options.activate.length; i++) {
						process(instance.$options.activate[i]);
					}
					return $services.q.defer($services.q.all(promises), resultingService ? resultingService : instance);
				}
				else {
					var promise = $services.q.defer();
					var done = function(result) {
						promise.resolve(result ? result : instance);
					};
					instance.$options.activate.call(instance, done);
					return promise;
				}
			}
			else {
				var promise = $services.q.defer();
				promise.resolve(instance);
				return promise;
			}
		};
		
		this.$initialize = function() {
			var instance = new component({ data: { "$services": $services }});
			if (parameters && parameters.lazy) {
				instance.$lazy = function() {
					if (!instance.$lazyInitialized) {
						instance.$lazyInitialized = new Date();
						return activate(instance);
					}
					else {
						var promise = $services.q.defer();
						promise.resolve(instance);
						return promise;
					}
				};
			}
			if (!parameters || !parameters.lazy) {
				// if we have service dependencies, make sure they are loaded first
				if (instance.$options.services && instance.$options.services.length) {
					var promises = [];
					for (var i = 0; i < instance.$options.services.length; i++) {
						var promise = $services.$promises[instance.$options.services[i]];
						if (!promise) {
							throw "Could not find service dependency: " + instance.$options.services[i];
						}
						promises.push(promise);
					}
					var promise = new nabu.utils.promise();
					new nabu.utils.promises(promises).then(function() {
						// create a new instance
						// this service may have dependencies in the form of watchers, computed properties... to remote services
						// these are not set up correctly if they are not available at creation time
						instance = new component({ data: { "$services": $services }});
						activate(instance).then(promise, promise);
					});
					return promise;
				}
				else {
					return activate(instance);
				}
			}
			else {
				return instance;
			}
		}
		
	}
	
	if (parameters && parameters.name) {
		var parts = parameters.name.split(".");
		var target = window;
		for (var i = 0; i < parts.length - 1; i++) {
			if (!target[parts[i]]) {
				target[parts[i]] = {};
			}
			target = target[parts[i]];
		}
		target[parts[parts.length - 1]] = service;
	}
	
	return service;
}

// mixin an activation sequence for lazy service loading
Vue.mixin({
	initialize: function(done) {
		if (this.$options.services) {
			if (!this.$services) {
				throw "No service provider found";
			}
			var promises = [];
			for (var i = 0; i < this.$options.services.length; i++) {
				var name = this.$options.services[i].split(".");
				var target = this.$services;
				for (var j = 0; j < name.length; j++) {
					if (!target) {
						throw "Could not find service: " + this.$options.services[i];
					}
					target = target[name[j]];
				}
				if (!target.$lazyInitialized && target.$lazy) {
					var result = target.$lazy();
					if (result.then) {
						promises.push(result); 
					}
				}
			}
			this.$services.q.all(promises).then(function() {
				done();
			});
		}
		else {
			done();
		}
	}
});