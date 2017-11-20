/**
 *
 *  This is the directive attached to actors/movies in the display view to cause the view to scroll to them
 *
**/

import angular from 'angular';


(() => {
	angular
		.module('app.scrollOnShow', [])
		.directive('scrollOnShow', [ '$timeout', $timeout => ($scope, $element, $attrs) => {
			$scope.$watch($attrs.ngHide, hidden => {
				if (!hidden) {
					// timeout to allow element to render
					$timeout(() => $scope.$emit('autoScroll', $element[0].offsetTop), 0);
				}
			});
		}]);
})();

