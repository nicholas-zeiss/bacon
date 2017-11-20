/**
 *
 * This is the root module for our web app. It simply imports all of our components, controllers, and services and injects them.
 * We also set up ngRoute in this file.
 *
**/


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
import './directives/AutoScroll';
import './directives/Hide';
import './directives/ScrollLock';
import './directives/ScrollOnShow';

// filters
import './filters/BirthDeath';
import './filters/DisplayHeader';
import './filters/Error';
import './filters/ImdbSearch';
import './filters/Jobs';

// services
import './services/arrowDetails';
import './services/getNodeTypes';
import './services/serverCalls';


angular.module('app', [
	'app.actorDetails',
	'app.actorChoice',
	'app.birthDeath',
	'app.displayHeader',
	'app.error',
	'app.imdbSearch',
	'app.jobs',
	'app.arrow',
	'app.autoScroll',
	'app.hide',
	'app.scrollLock',
	'app.scrollOnShow',
	'app.arrowDetails',
	'app.getNodeTypes',
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
		'getNodeTypes',
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

