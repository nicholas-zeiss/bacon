/**
 * This is the directive used to display movie arrows
 */

import angular from 'angular';

(() => {
 	angular.module('app.arrow', ['app.arrowDetails'])
 	.directive('arrow', ['arrowDetails', arrowDetails => {
		return {
			controller: function($scope, $element, $attrs) {
				Object.assign(this, arrowDetails($scope.node.type));
			},
			controllerAs: 'arrow',
			scope: true,
			templateUrl: '/client/templates/arrow.html'
		};
 	}]);
})();

