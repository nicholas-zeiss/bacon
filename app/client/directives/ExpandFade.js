/**
 * This is the directive used to trigger animations on actor/movie information
 * as it is displayed in the display view.
 */

import angular from 'angular';


(() => {
 	angular.module('app.expandFade', [])
 	.directive('expandFade', ['$timeout', $timeout => (scope, element, attrs) => {
 		let index = scope.$index;
 		let loading = scope.$parent.display.loading;
		
		scope.$watch(loading[index], () =>  {
			element.addClass('expand');

			$timeout(() => {
				element.removeClass('expand');
				element.addClass('fade');
			}, 550);
		});	
 	}]);
 })();

