/**
 *	This component is responsible for displaying actor choices when an ambiguous name has been searched
 */
 
import angular from 'angular';

(() => {
	angular.module('app.actorChoice', [])
	.component('actorChoice', {
		templateUrl: '/client/components/templates/actorChoice.html',
		bindings: { 
			actor: '<'
		}
	});
})();
