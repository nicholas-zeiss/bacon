
 
import angular from 'angular';

(() => {
	angular.module('app.arrowDownOnRight', [])
	.component('arrowDownOnRight', {
		templateUrl: '/client/components/arrows/templates/arrowDownOnRight.html',
		bindings: { 
			movie: '<'
		}
	});
})();

