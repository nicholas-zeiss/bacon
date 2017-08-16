/**
 * This filter formats an comma separated string of jobs into an easy to read string
 */


 import angular from 'angular';


(() => {
	angular.module('app.jobs', [])
	.filter('jobs', () => jobs => {
		

		function capitalize(str) {
			return str.replace(/^\w/, char => char.toUpperCase());
		}

		return jobs.split(',').map(capitalize).join(', ');
	});
})();
