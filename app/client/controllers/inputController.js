

function inputController($scope, serverCalls) {
	let vm = this;

	vm.name = '';
	vm.submit = submitName;


	function loadingStart() {
		$scope.$emit('reqStarted');
	}


	function loadingComplete(response) {
		console.log(response.data);
		$scope.$emit('reqSuccess', response.data);
	}


	function loadingFailed(response) {
		if (response.status === 300) {
			$scope.$emit('reqError', response.data)
		} else {
			$scope.$emit('reqError');
		}
	}


	function submitName() {
		loadingStart();
		serverCalls.getPathByName(vm.name, loadingComplete, loadingFailed);
		vm.name = '';
	}
}

export default inputController;