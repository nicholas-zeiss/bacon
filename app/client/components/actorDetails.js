
import angular from 'angular';

(() => {
	angular.module('app.actorDetails', [])
	.component('actorDetails', {
		templateUrl: '/client/templates/actorDetails.html',
		bindings: { 
			actor: '<'
		}
	});
})();