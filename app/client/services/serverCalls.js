/**
 *
 * This service handles all our server calls for getting the bacon path and related images
 *
**/


import angular from 'angular';


(() => {
	angular
		.module('app.serverCalls', [])
		.factory('serverCalls', [ '$http', '$rootScope', ($http, $rootScope) => {
			
			function success(res) {
				$rootScope.$broadcast('reqSuccess', res.data);
			}


			function failure(res) {
				$rootScope.$broadcast('reqError', res);
			}


			function getPathByName(name) {
				$http({
					method: 'POST',
					url: '/name',
					headers: { 'Content-Type': 'application/json' },
					data: JSON.stringify({ name })
				})
					.then(success, failure);
			}


			function getPathByNconst(nconst) {
				$http({
					method: 'POST',
					url: '/nconst',
					headers: { 'Content-Type': 'application/json' },
					data: JSON.stringify({ nconst })
				})
					.then(success, failure);
			}


			return {
				getPathByName,
				getPathByNconst
			};	
		}]);
})();

