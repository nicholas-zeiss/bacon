
import angular from 'angular';

import appController from './controllers/appController';
import displayController from './controllers/displayController';
import inputController from './controllers/inputController';

import './filters/actorFilter';

import './services/serverCalls';

angular.module('app', [
	'app.actorFilter',
	'app.serverCalls'
])
.controller('appController', [ '$scope', appController ])
.controller('displayController', displayController)
.controller('inputController', [ '$scope', 'serverCalls', inputController ])