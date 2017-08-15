
import angular from 'angular';

(() => {
	angular.module('app.serverCalls', [])
	.factory('serverCalls', ['$http', $http => {


		function getPathByName(name, success, failure) {
			$http({
				method: 'POST',
				url: '/name',
				headers: { 
					'Content-Type': 'application/json' 
				},
				data: JSON.stringify({ name })
			})
			.then(success, failure);
		}


		function getPathByNconst(nconst, number, success, failure) {
			$http({
				method: 'POST',
				url: '/nconst',
				headers: { 
					'Content-Type': 'application/json' 
				},
				data: JSON.stringify({ nconst, number })
			})
			.then(success, failure);
		}


		function getImages(actors, success, failure) {
			$http({
				method: 'POST',
				url: '/images',
				headers: { 
					'Content-Type': 'application/json' 
				},
				data: JSON.stringify(actors)
			})
			.then(success, failure);
		}

		return {
			getPathByName,
			getPathByNconst,
			getImages
		};
		
	}]);
})();