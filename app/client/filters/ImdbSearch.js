/**
 *
 *  This filter generates an error message when an actor the uses searched for is not in the database
 *
**/


import angular from 'angular';


(() => {
	angular
		.module('app.imdbSearch', [])
		.filter('imdbSearch', () => actor => `http://www.imdb.com/find?ref_=nv_sr_fn&q=${actor.replace(/\s/g, '+')}&s=nm`);
})();

