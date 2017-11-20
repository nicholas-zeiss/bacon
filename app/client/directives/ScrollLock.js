/**
 *
 *  This is the directive used to prevent a user scrolling the display view while it is autoscrolling.
 *
**/

import angular from 'angular';


(() => {
	angular
		.module('app.scrollLock', [])
		.directive('scrollLock', () => ($scope, $element, $attrs) => {
			
			$element.on('wheel', e => e.preventDefault());
			const [ scopeName, lockName ] = $attrs.scrollLock.split('.');
			
			const getLock = () => $scope[scopeName][lockName];
			const unlock = lock => lock ? null : $element.off('wheel');

			$scope.$watch(getLock, unlock);
		});
})();

