/**
 * This controller is responsible for user input. It handles searches and subsequent requests to the server.
 */


function InputController($scope, serverCalls) {
	let vm = this;

	vm.name = '';
	vm.disabled = false;

	vm.submit = submitName;


	$scope.on('disableInput' () => vm.disabled = true);

	$scope.on('enableInput' () => vm.disabled = false);


	//executes on user search for an actor
	function submitName() {
		if (vm.name === 'Kevin Bacon') {
			$scope.$emit('searchedForBacon');
			vm.name = '';
			return;
		}

		vm.disabled = true;

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

