
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