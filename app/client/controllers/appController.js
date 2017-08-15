/**
 * This is our root level controller. It ensures that we are on the proper url and holds app level information
 * such as the path to Kevin Bacon, if we are waiting on an http request, errors that need displaying, etc.
 */

function AppController($scope, $location) {
	let vm = this;

	vm.path = null;      //path to Kevin Bacon, which is of format [ [ actor, movie], ... , [ Kevin Bacon, null ]]
	vm.choices = null;   //if user searches for a name with multiple matches hold matches here
	vm.error = null;     //hold errors here

	vm.searchFor = null;

	//force return to Home view when user reloads page
	if ($location.path() !== '/' && (!vm.path || !vm.choices || !vm.error)) {
		$location.path('/');
	}


	//user just searched for actor, wait for response
	$scope.$on('reqStarted', (event, name) => {
		vm.path = null;
		vm.searchFor = name;
		
		$location.path('/loading');
	});


	//path found, switch to Display view
	$scope.$on('reqSuccess', (event, path) => {
		vm.path = path;
		
		$location.path(`/display/${path[0][0].nconst}`);
	});


	//no path found, either an error or multiple choices
	$scope.$on('reqError', (event, res) => {
		if (res.status === 300) {
			vm.choices = response.data;
			$location.path('/choose');
		
		} else if (res.status === 404) {
			vm.error = 'actor not found'
			$location.path('/');
		
		} else {
			vm.error = 'internal server error: ' + res.satus;
			$location.path('/');
		}
	});
}

export default AppController;

