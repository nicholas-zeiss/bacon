/**
 * This controller is responsible for user input. It handles searches and subsequent requests to the server.
 */


function InputController($scope, serverCalls) {
	let vm = this;

	vm.name = '';

	vm.submit = submitName;

	//executes on user search for an actor
	function submitName() {
		if (vm.name) {
			if (/kevin\sbacon/i.test(vm.name)) {
				$scope.$emit('searchedForBacon');

			} else {
				$scope.$emit('inputSubmission', vm.name);
			}

			vm.name = '';
		}
	}
}

export default InputController;

