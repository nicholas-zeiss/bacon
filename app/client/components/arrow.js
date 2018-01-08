/**
 *
 *  This is the directive used to display movie arrows
 *
**/

import angular from 'angular';


(() => {
	angular
		.module('app.arrow', [])
		.component('arrow', {
			bindings: { details: '<', movie: '<' },
			templateUrl: '/client/components/templates/arrow.html'
		});
})();

