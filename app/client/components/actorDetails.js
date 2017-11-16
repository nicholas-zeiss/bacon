/**
 *
 *	This component is responsible for displaying actor information as part of a path to Kevin Bacon in the display view.
 *
**/
 
 
import angular from 'angular';


(() => {
	angular
		.module('app.actorDetails', [])
		.component('actorDetails', {
			templateUrl: '/client/components/templates/actorDetails.html',
			bindings: { actor: '<' }
		});
})();

