/**
 * This service handles all our server calls for getting the bacon path and related images
 */


import angular from 'angular';


(() => {
	angular.module('app.serverCalls', [])
	.factory('serverCalls', ['$http', $http => {


		//helper function that handles getting image Urls for a path returned
		//by a post to /name or /nconst
		function getImages(path, success, failure) {
			let getImagesFor = [];

			//find actors who do not have an imgUrl
			path.forEach(([actor, movie]) => {
				if (!actor.imgUrl) {
					getImagesFor.push({ name: actor.name, nconst: actor.nconst });
				}
			});

			if (!getImagesFor.length) {
				success(path);
				return;
			}

			//if there are actors to search for make the post request
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


		//handles a post to /name
		function getPathByName(name, success, failure) {
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

				getImages(path, success, failure);			
			}, failure);
		}


		//handles a post to /nconst
		function getPathByNconst(nconst, success, failure) {
			$http({
				method: 'POST',
				url: '/nconst',
				headers: { 
					'Content-Type': 'application/json' 
				},
				data: JSON.stringify(nconst)
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