

function appController($scope) {
	let vm = this;

	vm.path = null;
	vm.loading = false;


	$scope.$on('reqStarted', () => {
		vm.path = null;
		vm.loading = true;
	});


	$scope.$on('reqSuccess', (event, path) => {
		vm.loading = false;
		vm.path = path;	
	});


	$scope.$on('reqError', (event, choices) => {
		console.log(choices);
		vm.loading = false;
	});
}

export default appController;