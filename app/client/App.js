
import angular from 'angular';
import ngRoute from 'angular-route';

import './components/actorDetails';
import './components/movieDetails';


import AppController from './controllers/AppController';
import ChooseController from './controllers/ChooseController';
import DisplayController from './controllers/DisplayController';
import HomeController from './controllers/HomeController';
import InputController from './controllers/InputController';
import LoadingController from './controllers/LoadingController';

import './services/serverCalls';

angular.module('app', [
	'app.serverCalls',
	'app.actorDetails',
  'app.movieDetails',
	'ngRoute'
])
.controller('ChooseController', ChooseController)
.controller('DisplayController', [
  '$scope',
  'serverCalls',
  DisplayController
])
.controller('HomeController', HomeController)
.controller('LoadingController', LoadingController)
.controller('AppController', [
	'$scope',
	'$location',
	AppController
])
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


