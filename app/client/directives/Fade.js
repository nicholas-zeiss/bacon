/**
 * This is the directive used to trigger animations on actor/movie information
 * as it is displayed in the display view.
 */

import angular from 'angular';


(() => {
 	angular.module('app.fade', [])
 	.directive('fade', ['$timeout', $timeout => ($scope, $element, $attrs) => {		
		
		function fade() {
			$element.addClass('fade');

			$timeout(() => {
				$element.removeClass('fade');
			}, Number($attrs.fade));
		}

		if ($attrs.fadeDelay) {
			$timeout(fade, Number($attrs.fadeDelay));
		} else {
			fade();
		}
 	}]);
 })();

