/**
 *
 *  This filter formats an array of [ int birthYear, int deathYear] into an easy to read string
 *
**/


import angular from 'angular';


(() => {
	angular
		.module('app.birthDeath', [])
		.filter('birthDeath', () => (
			([dob, dod]) => dob ? `${dob} - ${dod ? dod : 'present'}` : '')
		);
})();

