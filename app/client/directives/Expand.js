/**
 * This is the directive used to trigger the expand animation on actor/movie information
 * as it is displayed in the display view.
 */

import angular from 'angular';


(() => {
 	angular.module('app.expand', [])
 	.directive('expand', ['$timeout', $timeout => ($scope, $element, $attrs) => {		
		$element.addClass('expand');

		$timeout(() => {
			$element.removeClass('expand');
		}, Number($attrs.expand));
 	}]);
 })();

