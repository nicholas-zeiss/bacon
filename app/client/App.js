/**
 * This is the root module for our web app. It simply imports all of our components, controllers, and services and injects them.
 * We also set up ngRoute in this file.
 *
 * The web app has three main sections:
 *   - Input, handled by the InputController, allows users to search for actors
 *   - Content varies depending on the state of the app according to the route controller
 *   - Footer is dumb html that displays a bit of information
 *
 * All three sections are children of the AppController which resides in the body element
 */


import angular from 'angular';
import ngRoute from 'angular-route';

// components
import './components/actorDetails';
import './components/actorChoice';

// controllers
import AppController from './controllers/AppController';
import ChooseController from './controllers/ChooseController';
import DisplayController from './controllers/DisplayController';
import InputController from './controllers/InputController';

// directives
import './directives/Arrow';
import './directives/Hide';
import './directives/ScrollLock';

// filters
import './filters/BirthDeath';
import './filters/DisplayHeader';
import './filters/Error';
import './filters/Jobs';

// services
import './services/arrowDetails';
import './services/nodeTypes';
import './services/serverCalls';


angular.module('app', [
	'app.actorDetails',
	'app.actorChoice',
	'app.birthDeath',
	'app.displayHeader',
	'app.error',
	'app.jobs',
	'app.arrow',
	'app.hide',
	'app.scrollLock',
	'app.arrowDetails',
	'app.nodeTypes',
	'app.serverCalls',
	'ngRoute'
])
	.controller('AppController', [
		'$scope',
		'$location',
		'serverCalls',
		AppController
	])
	.controller('ChooseController', [
		'$scope',
		ChooseController
	])
	.controller('DisplayController', [
		'$scope',
		'$timeout',
		'$window',
		'nodeTypes',
		DisplayController
	])
	.controller('InputController', [
		'$scope',
		'$timeout',
		InputController
	])
	.config(['$routeProvider', $routeProvider => {
		$routeProvider
			.when('/home', {
				templateUrl: 'client/templates/home.html'
			})
			.when('/loading', {
				templateUrl: 'client/templates/loading.html'
			})
			.when('/choose/:name', {
				templateUrl: 'client/templates/choose.html',
				controller: 'ChooseController',
				controllerAs: 'choice'
			})
			.when('/display/:nconst', {
				templateUrl: 'client/templates/display.html',
				controller: 'DisplayController',
				controllerAs: 'display'
			})
			.otherwise({
				redirectTo:'/home'
			});
	}])
	.config(['$locationProvider', $locationProvider => {
		$locationProvider.html5Mode({
			enabled: true,
			requireBase: true,
			rewriteLinks: true
		});
	}]);

