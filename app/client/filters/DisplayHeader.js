/**
 *
 *  This filter formats an array of [ str name, int number] into an easy to read text for the header at the top of the page.
 *
**/


import angular from 'angular';


(() => {
	angular
		.module('app.displayHeader', [])
		.filter('displayHeader', () => ([name, number]) => `${name} is ${number} degree${number > 1 ? 's' : ''} from Kevin Bacon`);
})();

