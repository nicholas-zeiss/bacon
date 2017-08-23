
 
import angular from 'angular';

(() => {
	angular.module('app.arrowDownOnLeft', [])
	.component('arrowDownOnLeft', {
		templateUrl: '/client/components/arrows/templates/arrowDownOnLeft.html',
		bindings: { 
			movie: '<'
		}
	});
})();

