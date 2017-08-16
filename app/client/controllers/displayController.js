/**
 * This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 * and must be shown to the user.
 */

function DisplayController($scope, $timeout, $location, $anchorScroll) {
	let vm = this;

	console.log('started display controller')

	vm.path = [$scope.app.path[0]];
	vm.pathIndex = 0;

	vm.loading = {};
	$scope.app.path.forEach((actorMovie, i) => vm.loading[i] = true);

	
	vm.loaded = function(index) {
		vm.loading[index] = false;

		console.log($location.hash(), index);
		// $location.hash('node-' + index).replace();
		// window.location.hash = 'node-' + index;
		// console.log($location.hash());

		if (++vm.pathIndex < $scope.app.path.length) {
			$timeout(() => {
				vm.path.push($scope.app.path[vm.pathIndex]);

				//if pathIndex is odd it points to a movie which has no onload event
				if (vm.pathIndex % 2) {
					vm.loaded(vm.pathIndex);
				}
			}, 2500);
		} 
	}
}

export default DisplayController;

