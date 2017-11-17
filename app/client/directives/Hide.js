/**
 *
 *  This is the directive used to hide actor/movie nodes until ready to be displayed.
 *  Once no longer hidden it adds the fade-in class to trigger a css animation.
 *
**/

import angular from 'angular';


(() => {
	angular
		.module('app.hide', [])
		.directive('hide', () => ($scope, $element, $attrs) => {		
			$scope.$watch($attrs.hide, value => {
				if (value) {
					$element.addClass('hide');
				} else {
					$element.addClass('fade-in');
					$element.removeClass('hide');
				}
			});
		});
})();

