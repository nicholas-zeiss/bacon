/**
 * Given a device size and length of the path to bacon, return an array of types
 * for each node in the path (actor or appropriate arrow for movies)
 */


import angular from 'angular';


(() => {
	angular.module('app.nodeTypes', [])
	.factory('nodeTypes', () => {


		function small(length) {

		}


		function medium(length) {

		}


		function large(length) {

		}


		return (size, length) => {
			if (size == 'small') {
				return small(length);
			} else if (size == 'medium') {
				return medium(length);
			} else {
				return large(length);
			}
		};
		
	});
})();

