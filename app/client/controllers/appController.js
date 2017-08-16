/**
 * This is our root level controller. It ensures that we are on the proper url and holds app level information
 * such as the path to Kevin Bacon, if we are waiting on an http request, errors that need displaying, etc.
 */


function AppController($scope, $location, serverCalls) {	
	let vm = this;

	vm.path = null;      //path to Kevin Bacon, which is of format [ actor1, movie1, ... , Kevin Bacon ]
	vm.choices = null;   //if user searches for a name with multiple matches hold matches here
	vm.error = null;     //hold errors here
	vm.searchName = null;
	vm.inputDisabled = false;
	

	//reroute as appropriate on reload, if url is /display/nconst load it, otherwise stay here
	//also wipes the hash
	if ($location.path() !== '/home' || $location.hash()) {
		$location.hash('');
		
		if (/^\/display\/\d+$/.test($location.path())) {
			let nconst = Number($location.path().match(/(\d+)$/)[1]);
			vm.searchName = 'index: ' + nconst;
			vm.inputDisabled = true;
			
			serverCalls.getPathByNconst(nconst, loadPath, handleError);

			$location.path('/loading');

		} else {
			$location.path('/home').replace();
		}
	}


	/**	--------------------------------------------- *
	 *																								*
	 *     Event Listeners for activity in the		    *
	 *     display view																*
	 *																								*
	 * ---------------------------------------------- **/


	//user clicked the clear button, reset app 
	$scope.$on('reset', reset);


	//display loaded all of the path into the dom, enable input
	$scope.$on('displayFinishedLoading', () => {
		vm.inputDisabled = false
	});


	function reset() {
		vm.path = null;
		vm.choices = null;
		vm.error = null;
		vm.searchName = null;
		vm.inputDisabled = false;

		$location.hash('');
		$location.path('/home').replace();
	}


  /**	--------------------------------------------- *
	 *																								*
	 *     Event Listeners for server activity		    *
	 *																								*
	 * ---------------------------------------------- **/


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


	//handle a successful response from the server
	function loadPath(path) {
		vm.path = path.reduce((path, actorMovie) => path.concat(actorMovie), []);
		
		//remove the null placeholder for Kevin Bacon's movie
		vm.path = vm.path.slice(0, -1);

		$location.path(`/display/${vm.path[0].nconst}`).replace();
	}


	//handle an error from the server
	function handleError(res) {
		vm.inputDisabled = false;

		if (res.status === 300) {
			vm.choices = res.data;
			$location.path('/choose').replace();
		
		} else if (res.status === 404) {
			vm.error = 'actor not found';
			$location.path('/').replace();
		
		} else {
			vm.error = 'internal server error: ' + res.status;
			$location.path('/').replace();
		}
	}
}

export default AppController;

