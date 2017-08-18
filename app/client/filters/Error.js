/**
 * This filter formats an comma separated string of jobs into an easy to read string
 */


 import angular from 'angular';


(() => {
	angular.module('app.error', [])
	.filter('error', () => ([error, name]) => {
		if (error == 404) {
			return name + ' is not within six degrees of Kevin Bacon';
		} else {
			return 'Internal Server Error: ' + error;
		}
	});
})();

