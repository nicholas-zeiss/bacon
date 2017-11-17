/**
 *
 *  This filter formats an comma separated string of jobs into an easy to read string
 *
**/


import angular from 'angular';


(() => {
	angular
		.module('app.jobs', [])
		.filter('jobs', () => jobs => jobs ? jobs.replace(/(,)|(_)/g, '$1 ') : '');
})();

