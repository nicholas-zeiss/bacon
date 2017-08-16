/**
 * This controller is responsible for user input. It handles searches and subsequent requests to the server.
 */


function InputController($scope, serverCalls) {
	let vm = this;

	vm.name = '';

	vm.submit = submitName;

	//executes on user search for an actor
	function submitName() {
		if (!vm.name) {
			return;

		} else if (vm.name === 'Kevin Bacon') {
			$scope.$emit('searchedForBacon');
			vm.name = '';
			return;
		}

		$scope.$emit('reqStarted', vm.name);

		serverCalls.getPathByName(vm.name, res => {
			vm.name = '';
			$scope.$emit('reqSuccess', res);
		
		}, res => {		
			$scope.$emit('reqError', res)
		});
	}
}

export default InputController;

