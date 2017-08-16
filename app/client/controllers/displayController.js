/**
 * This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 * and must be shown to the user.
 */

function DisplayController($scope, $timeout, $interval) {
	let vm = this;

	console.log('display controller loaded at\n', Date.now())

	vm.path = [ $scope.app.path[0] ];
	vm.pathIndex = 0;

	vm.baconIndex = $scope.app.path.length - 1;

	vm.loading = {};

	$scope.app.path.forEach((actorMovie, i) => {
		vm.loading[i] = true;
	});

	vm.loaded = function(index) {
		// without doing this in a timeout the actor-movie-node loads so quickly
		// that ng-hide doesn't register properly and there is no transition
		$timeout(() => {
			vm.loading[index] = false;

			if (vm.pathIndex < vm.baconIndex) {
				$timeout(() => vm.path.push($scope.app.path[++vm.pathIndex]), 2000);
			}
		}, 10);
	}
}

export default DisplayController;

