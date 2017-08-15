/**
 *	This component is responsible for displaying movie information as part of a path to Kevin Bacon in the display view.
 */

import angular from 'angular';

(() => {
	angular.module('app.movieDetails', [])
	.component('movieDetails', {
		templateUrl: '/client/templates/movieDetails.html',
		bindings: { 
			movie: '<'
		}
	});
})();