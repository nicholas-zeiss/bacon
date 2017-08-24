/**
 * This is the directive used to display straight down movie arrows
 */

import angular from 'angular';


(() => {
 	angular.module('app.arrowDown', [])
 	.directive('arrowDown', () => {
		return {
			scope: {
				movie: '=movie',
				type: '=type'
			},
			templateUrl: '/client/templates/arrows/arrowDown.html'
		};
 	});
})();

