/**
 * This is the directive used to display the arrows going down from right/left to center
 */

import angular from 'angular';


(() => {
 	angular.module('app.arrowToCenter', [])
 	.directive('arrowToCenter', () => {
		return {
			scope: {
				movie: '=movie',
				type: '=type'
			},
			templateUrl: '/client/templates/arrows/arrowToCenter.html'
		};
 	});
})();

