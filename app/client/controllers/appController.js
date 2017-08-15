

function AppController($scope, $location) {
	let vm = this;

	vm.path = null;
	vm.choices = null;
	vm.error = null;

	if ($location.path() !== '/' && (!vm.path || !vm.choices || !vm.error)) {
		$location.path('/');
	}


	$scope.$on('reqStarted', () => {
		vm.path = null;
		$location.path('/loading');
	});


	$scope.$on('reqSuccess', (event, path) => {
		vm.path = path;
		console.log(path);
		$location.path('/display/' + path[0][0].nconst);
	});


	$scope.$on('reqError', (event, res) => {
		if (res.status === 300) {
			vm.choices = response.data;
			$location.path('/choose');
		} else if (res.status === 404) {
			vm.error = 'actor not found'
			$location.path('/');
		} else {
			vm.error = 'internal server error'
			$location.path('/');
		}
	});
}

export default AppController;