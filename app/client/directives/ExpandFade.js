/**
 * This is the directive used to trigger animations on actor/movie information
 * as it is displayed in the display view.
 */

 import angular from 'angular';
 import ngAnimate from 'angular-animate';

 (() => {
 	angular.module('app.expandFade', ['ngAnimate'])
 	.directive('expandFade', ['$animate', '$timeout', ($animate, $timeout) => {

 		return function(scope, element, attrs) {
	 		let index = scope.$index;
	 		let loading = scope.$parent.display.loading;
	 		
	 		function listener() {
 				// console.log('listener activated ', attrs)

 				$animate.addClass(element, 'expand');

 				//add expand-active after 10ms
 				$timeout(() => {
 					$animate.setClass(element, 'fade', 'expand');

 				// 	//remove expand expand-active after 1100 ms
 				// 	$timeout(() => {
 				// 		$animate.removeClass(element, 'expand expand-active');

 				// 		//add fade after 10 ms
 				// 		$timeout(() => {
 				// 			$animate.addClass(element, 'fade');

 				// 			//add fade-active after 10 ms
 				// 			$timeout(() => {
 				// 				$animate.addClass(element, 'fade-active');

 				// 				//remove fade fade-active after 1100 ms
 				// 				$timeout(() => {

 				// 					$animate.removeClass(element, 'fade fade-active');

 				// 				}, 1100);
 				// 			}, 10);
 				// 		}, 10);
 				// 	}, 1100);
 				}, 1100);
	 		}
 		
 			scope.$watch(loading[index], listener);
 		}	
 	}]);
 })();

