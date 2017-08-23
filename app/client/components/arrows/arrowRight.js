
 
import angular from 'angular';

(() => {
	angular.module('app.arrowRight', [])
	.component('arrowRight', {
		templateUrl: '/client/components/arrows/templates/arrowRight.html',
		bindings: { 
			movie: '<'
		}
	});
})();

