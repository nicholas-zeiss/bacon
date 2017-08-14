

function InputController($scope, serverCalls) {
	let vm = this;

	vm.name = '';
	vm.submit = submitName;

	//TODO special case for kevin bacon
	function submitName() {
		loadingStart();
		serverCalls.getPathByName(vm.name, loadingComplete, loadingFailed);
		// vm.name = '';
	}

	function loadingStart() {
		$scope.$emit('reqStarted');
	}

	function loadingComplete(response) {
		console.log(response.data);
		$scope.$emit('reqSuccess', response.data);
	}

	function loadingFailed(response) {
		$scope.$emit('reqError', response)
	}
}

export default InputController;