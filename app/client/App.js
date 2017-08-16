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
import ngAnimate from 'angular-animate';
import ngRoute from 'angular-route';

//components
import './components/actorDetails';
import './components/movieDetails';

//controllers
import AppController from './controllers/AppController';
import ChooseController from './controllers/ChooseController';
import DisplayController from './controllers/DisplayController';
import HomeController from './controllers/HomeController';
import InputController from './controllers/InputController';
import LoadingController from './controllers/LoadingController';

//services
import './services/serverCalls';


angular.module('app', [
  'app.actorDetails',
  'app.movieDetails',
	'app.serverCalls',
  'ngAnimate',
  'ngRoute'
])
.controller('AppController', [
	'$scope',
	'$location',
  'serverCalls',
	AppController
])
.controller('ChooseController', ChooseController)
.controller('DisplayController', [
  '$scope',
  DisplayController
])
.controller('HomeController', HomeController)
.controller('LoadingController', LoadingController)
.controller('InputController', [
	'$scope',
	'serverCalls',
	InputController
])
.config($routeProvider => {
  $routeProvider
    .when('/', {
      templateUrl: 'client/templates/home.html',
      controller: 'HomeController',
      controllerAs: 'home'
    })
    .when('/loading', {
      templateUrl: 'client/templates/loading.html',
      controller: 'LoadingController',
      controllerAs: 'loading'
    })
    .when('/choose', {
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
      redirectTo:'/'
    });
});

