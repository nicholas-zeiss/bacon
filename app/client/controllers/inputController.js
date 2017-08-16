/**
 * This controller is responsible for user input. It handles searches and subsequent requests to the server.
 */


function InputController($scope, serverCalls) {
	let vm = this;

	vm.name = '';
	vm.loading = false;

	vm.submit = submitName;


	//executes on user search for an actor
	function submitName() {
		if (vm.name === 'Kevin Bacon') {
			$scope.$emit('searchedForBacon');
			vm.name = '';
			return;
		}

		vm.loading = true;

		$scope.$emit('reqStarted', vm.name);

		serverCalls.getPathByName(vm.name, res => {
			vm.name = '';
			vm.loading = false;
		
			$scope.$emit('reqSuccess', res);
		
		}, res => {
			vm.loading = false;
		
			$scope.$emit('reqError', res)
		});
	}
}

export default InputController;

