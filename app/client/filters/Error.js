/**
 * This filter formats an error and name into an informational message
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

