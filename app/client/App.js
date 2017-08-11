import angular from 'angular';

let app = angular.module('root', []);

app.factory('dataFetcher', ['$http', function($http) {

	this.getPath = function(name) {
		$http.get('/path')
	}

}]);