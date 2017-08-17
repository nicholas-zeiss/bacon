/**
 * This filter formats an array of [ str name, int number] into an easy to read header for the display view
 */


import angular from 'angular';


(() => {
	angular.module('app.displayHeader', [])
	.filter('displayHeader', () => ([name, number]) => {		
		return `${name} is ${number} degree${number > 1 ? 's' : ''} from Kevin Bacon`;
	});
})();
