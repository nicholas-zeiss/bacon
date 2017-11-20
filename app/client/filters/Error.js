/**
 *
 *  This filter formats an error and name into an informational message
 *
**/


import angular from 'angular';


(() => {
	angular
		.module('app.error', [])
		.filter('error', () => ([error, name]) => {
			if (error == 404) {
				if (/^index:\s/.test(name)) {
					return name.slice(7) + ' is not a valid index';
				}

				return name + ' is not within six degrees of Kevin Bacon';
			} else {
				return 'Internal Server Error: ' + error;
			}
		});
})();

