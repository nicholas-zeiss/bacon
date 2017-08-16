/**
 * This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 * and must be shown to the user.
 */

function DisplayController($scope, $timeout, $interval) {
	let vm = this;

	vm.path = [];
	vm.pathIndex = 0;

	$timeout(() => vm.path.push($scope.app.path[0]), 100);

	vm.loading = {};
	$scope.app.path.forEach((actorMovie, i) => vm.loading[i] = true);

	
	vm.loaded = function(index) {
		// without doing this in a timeout the actor-node loads so quickly
		// that ng-hide doesn't register properly and there is no transition
		

		// $timeout(() => {
			vm.loading[index] = false;

			if (++vm.pathIndex < $scope.app.path.length) {
				$timeout(() => {
					vm.path.push($scope.app.path[vm.pathIndex]);

					//if pathIndex is odd it points to a movie which has no onload event
					if (vm.pathIndex % 2) {
						vm.loaded(vm.pathIndex);
					}
				}, 2000);
			} 
			// else if (vm.pathIndex == $scope.app.path.length) {
			// 	vm.path.splice(3, 1);
			// 	console.log(vm.path);
			// 	$timeout(() => console.log(vm.path), 2000)
			// }
		// }, 100);
	}
}

export default DisplayController;

