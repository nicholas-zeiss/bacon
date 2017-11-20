/**
 *
 *  This is the directive used to scroll the display view automatically as actors/movies come into view
 *
**/

import angular from 'angular';
import $ from 'jquery';


(() => {
	angular
		.module('app.autoScroll', [])
		.directive('autoScroll', () => ($scope, $element, $attrs) => {
			const element = $('#' + $attrs.id);
			const scroll = (event, scrollTop) => { 
				element.stop(true); 
				element.animate({ scrollTop }, 900);
			};

			$scope.$on('autoScroll', scroll);
		});
})();

