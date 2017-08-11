
import angular from 'angular';

(() => {
	angular.module('app.serverCalls', [])
	.factory('serverCalls', ['$http', ($http) => {

		return {
			getPathByName: function(name, success, failure) {
				$http({
					method: 'POST',
					url: '/name',
					headers: { 
						'Content-Type': 'application/json' 
					},
					data: JSON.stringify({ name })
				})
				.then(success, failure)
			},
			getPathByNconst: function(nconst, number, success, failure) {
				$http({
					method: 'POST',
					url: '/nconst',
					headers: { 
						'Content-Type': 'application/json' 
					},
					data: JSON.stringify({ nconst, number })
				})
				.then(success, failure)
			}
		};
	}]);
})();