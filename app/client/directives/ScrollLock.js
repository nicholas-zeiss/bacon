/**
 *
 *  This is the directive used to prevent a user scrolling the display view while it is autoscrolling.
 *
**/

import angular from 'angular';


(() => {
	angular
		.module('app.scrollLock', [])
		.directive('scrollLock', () => ($scope, $element) => {
			$element.on('wheel', e => e.preventDefault());
			$scope.$on('unlockScroll', () => $element.off('wheel'));
		});
})();

