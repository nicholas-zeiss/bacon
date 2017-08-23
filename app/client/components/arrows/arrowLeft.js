
 
import angular from 'angular';

(() => {
	angular.module('app.arrowLeft', [])
	.component('arrowLeft', {
		templateUrl: '/client/components/arrows/templates/arrowLeft.html',
		bindings: { 
			movie: '<'
		}
	});
})();

