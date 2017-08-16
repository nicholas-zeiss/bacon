/**
 * This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 * and must be shown to the user.
 */

function DisplayController($scope, $timeout, $location, $route) {
	let vm = this;

	console.log('started display controller')

	vm.path = [$scope.app.path[0]];
	vm.pathIndex = 0;

	vm.loading = {};
	$scope.app.path.forEach((actorMovie, i) => vm.loading[i] = true);

	vm.currentUrl = $location.path();
	vm.currentRoute = $route.current;

	//prevent page reload when $location.hash is altered
	$scope.$on('$locationChangeSuccess', event => {
		if (vm.currentUrl == $location.path()) {
			$route.current = vm.currentRoute;
		}
	});
	
	
	vm.loaded = function(index) {
		vm.loading[index] = false;

		$location.hash('node-' + index);

		if (++vm.pathIndex < $scope.app.path.length) {
			$timeout(() => {
				vm.path.push($scope.app.path[vm.pathIndex]);

				//if pathIndex is odd it points to a movie-node which has no onload event
				//so we must invoke this function manually
				if (vm.pathIndex % 2) {
					vm.loaded(vm.pathIndex);
				}
			}, 2500);
		} 
	}
}

export default DisplayController;

