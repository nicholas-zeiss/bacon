/**
 * This is the directive used to display left and right movie arrows
 */

import angular from 'angular';


(() => {
 	angular.module('app.scrollLock', [])
 	.directive('scrollLock', () => ($scope, $element) => {		
		$element.on('wheel', e => {
			e.preventDefault();
		});

		$scope.$on('scrollable', () => {
			$element.off('wheel');
		})
	});
})();

