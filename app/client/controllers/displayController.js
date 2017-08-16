/**
 * This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 * and must be shown to the user.
 */

function DisplayController($scope) {
	let vm = this;

	vm.path = $scope.app.path;

	vm.loaded = function(index) {
		console.log(index, ' has loaded');
	}
}

export default DisplayController;

