/**
 * This service handles all our server calls for getting the bacon path and related images
 */


import angular from 'angular';


(() => {
	angular.module('app.serverCalls', [])
	.factory('serverCalls', ['$http', '$rootScope', ($http, $rootScope) => {


		//helper function that handles getting image Urls for a path returned
		//by a post to /name or /nconst
		function getImages(path, success, failure) {
			let getImagesFor = [];

			path.forEach(([actor, movie]) => {
				if (actor.imgUrl === '') {
					getImagesFor.push({ name: actor.name, nconst: actor.nconst });
				}
			});

			if (!getImagesFor.length) {
				success(path);
				return;
			}


			$http({
				method: 'POST',
				url: '/images',
				headers: { 
					'Content-Type': 'application/json' 
				},
				data: JSON.stringify(getImagesFor)
			})
			.then(res => {
				let imgUrls = res.data;

				path.forEach(([actor, movie]) => {
					if (!actor.imgUrl && imgUrls[actor.name]) {
						actor.imgUrl = imgUrls[actor.name];
					}
				});

				success(path);
			},
			res => {
				failure(res);
			});
		}

		
		function success(path) {
			$rootScope.$broadcast('reqSuccess', path);
		}

		function failure(res) {
			$rootScope.$broadcast('reqError', res);
		}


		//handles a post to /name
		function getPathByName(name) {
			$http({
				method: 'POST',
				url: '/name',
				headers: { 
					'Content-Type': 'application/json' 
				},
				data: JSON.stringify({ name })
			})
			.then(res => {
				let path = res.data;
				console.log(res)

				getImages(path, success, failure);
			}, failure);
		}


		//handles a post to /nconst
		function getPathByNconst(nconst) {
			$http({
				method: 'POST',
				url: '/nconst',
				headers: { 
					'Content-Type': 'application/json' 
				},
				data: JSON.stringify({ nconst })
			})
			.then(res => {
				let path = res.data;

				getImages(path, success, failure);			
			}, failure);
		}


		return {
			getPathByName,
			getPathByNconst
		};	
	}]);
})();

