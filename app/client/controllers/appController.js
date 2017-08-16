/**
 * This is our root level controller. It ensures that we are on the proper url and holds app level information
 * such as the path to Kevin Bacon, if we are waiting on an http request, errors that need displaying, etc.
 */


function AppController($scope, $location, serverCalls) {
	console.log('started app controller');
	
	let vm = this;

	vm.path = null;      //path to Kevin Bacon, which is of format [ actor1, movie1, ... , Kevin Bacon ]
	vm.choices = null;   //if user searches for a name with multiple matches hold matches here
	vm.error = null;     //hold errors here
	vm.searchName = null;
	

	//reroute as appropriate on reload, if url is /display/nconst load it, otherwise stay here
	//also wipes the hash
	if ($location.path() !== '/home' || $location.hash()) {
		$location.hash('');
		
		if (/^\/display\/\d+$/.test($location.path())) {
			let nconst = Number($location.path().match(/(\d+)$/)[1]);
			vm.searchName = 'index: ' + nconst;
			
			serverCalls.getPathByNconst(nconst, loadPath, handleError);
			$scope.$broadcast('disableInput');

			$location.path('/loading');

		} else {
			$location.path('/home').replace();
		}
	}


	$scope.$on('reset', reset);


	function reset() {
		vm.path = null;
		vm.choices = null;
		vm.error = null;
		vm.searchName = null;

		$location.hash('');
		$location.path('/home').replace();
	}


	// Event Listeners for input or server activity

	//user just searched for actor, wait for response
	$scope.$on('reqStarted', (event, name) => {
		vm.path = null;
		vm.searchName = name;
		
		$location.path('/loading');
	});


	//path found, switch to Display view
	$scope.$on('reqSuccess', (event, path) => {
		loadPath(path);
	});


	//no path found, either an error or multiple choices
	$scope.$on('reqError', (event, res) => handleError(res));


	function loadPath(path) {
		vm.path = path.reduce((path, actorMovie) => path.concat(actorMovie), []);
		
		//remove the null placeholder for Kevin Bacon's movie
		vm.path = vm.path.slice(0, -1);

		$location.path(`/display/${vm.path[0].nconst}`).replace();
	}


	function handleError(res) {
		if (res.status === 300) {
			vm.choices = res.data;

			$scope.$broadcast('enableInput');
			$location.path('/choose').replace();
		
		} else if (res.status === 404) {
			vm.error = 'actor not found';

			$scope.$broadcast('enableInput');
			$location.path('/').replace();
		
		} else {
			vm.error = 'internal server error: ' + res.status;

			$scope.$broadcast('enableInput');
			$location.path('/').replace();
		}
	}
}

export default AppController;

