/**
 *
 * This is the root module for our web app. It simply imports all of our components, controllers, and services and injects them.
 * We also set up ngRoute in this file.
 *
**/


import angular from 'angular';
import ngRoute from 'angular-route';

// components
import './components/actorChoice';
import './components/actorDetails';
import './components/arrow';

// controllers
import AppController from './controllers/AppController';
import ChooseController from './controllers/ChooseController';
import DisplayController from './controllers/DisplayController';
import InputController from './controllers/InputController';

// filters
import './filters/DisplayHeader';
import './filters/Error';
import './filters/ImdbSearch';

// directives
import './directives/AutoScroll';
import './directives/Hide';
import './directives/ScrollLock';

// services
import './services/arrowDetails';
import './services/getNodeTypes';
import './services/serverCalls';


angular.module('app', [
	'app.actorChoice',
	'app.actorDetails',
	'app.arrow',
	'app.displayHeader',
	'app.error',
	'app.imdbSearch',
	'app.autoScroll',
	'app.hide',
	'app.scrollLock',
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
		'arrowDetails',
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

