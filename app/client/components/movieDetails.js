/**
 *	This component is responsible for displaying movie information as part of a path to Kevin Bacon in the display view.
 */


//TODO - delete

import angular from 'angular';

(() => {
	angular.module('app.movieDetails', [])
	.component('movieDetails', {
		templateUrl: '/client/components/templates/movieDetails.html',
		bindings: { 
			movie: '<'
		}
	});
})();

