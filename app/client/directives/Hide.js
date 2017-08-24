/**
 * This is the directive used to hide actor/movie nodes until ready to be displayed.
 * Unlike ng-hide, this uses visibility not display, so layout is preserved.
 * Once no longer hidden it adds the fade-in
 */

import angular from 'angular';


(() => {
 	angular.module('app.hide', [])
 	.directive('hide', () => ($scope, $element, $attrs) => {		
		$scope.$watch($attrs.hide, (value) => {
			if (value) {
				$element.addClass('hide');
			
			} else {
				$element.removeClass('hide');
				$element.addClass('fade-in');
			}
		});
 	});
})();

