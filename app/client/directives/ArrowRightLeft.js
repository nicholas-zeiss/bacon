/**
 * This is the directive used to display left and right movie arrows
 */

import angular from 'angular';


(() => {
 	angular.module('app.arrowRightLeft', [])
 	.directive('arrowRightLeft', () => {		
		return {
			scope: {
				movie: '=movie',
				type: '=type'
			},
			templateUrl: ($element, $attrs) => {
				console.log($attrs.foo)
				return '/client/templates/arrows/arrowRightLeft.html'
			}
		};
 	});
})();

