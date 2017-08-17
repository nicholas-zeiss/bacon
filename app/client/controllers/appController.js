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
	vm.view = 'home';		//tracked for generating an id on element containing the view

	//set vm.view and reroute as appropriate on reload
	if ($location.path() !== '/home') {		
		if (/^\/display\/\d+$/.test($location.path())) {
			let nconst = Number($location.path().match(/(\d+)$/)[1]);
			
			vm.inputDisabled = true;
			vm.view = 'loading';
			vm.searchName = `index: ${nconst}`;
			
			serverCalls.getPathByNconst(nconst);

			$location.path('/loading').replace();

		} else {
			$location.path('/home').replace();
		}
	}


	//handler for browser using back/forward through history
	// $scope.$on('locationChangeSuccessful', () => {

	// });


	/**	--------------------------------------------- *
	 *																								*
	 *     Event Listeners for activity in the		    *
	 *     						display view										*
	 *																								*
	 * ---------------------------------------------- **/


	//user clicked the clear button, reset app 
	$scope.$on('reset', () => {
		vm.path = null;
		vm.choices = null;
		vm.error = null;
		vm.searchName = null;
		vm.inputDisabled = false;
		vm.view = 'home';

		$location.path('/home');
	});


	//display loaded all of the path into the dom, enable input
	$scope.$on('displayFinishedLoading', () => {
		vm.inputDisabled = false;
	});


  /**	--------------------------------------------- *
	 *																								*
	 *     Event Listeners for server activity		    *
	 *																								*
	 * ---------------------------------------------- **/


	//user just searched for actor, wait for response
	$scope.$on('reqStarted', (event, name) => {
		vm.path = null;
		vm.searchName = name;
		vm.inputDisabled = true;
		vm.view = 'loading';
		
		$location.path('/loading');
	});


	//path found, switch to Display view
	$scope.$on('reqSuccess', (event, path) => {
		vm.view = 'display';
		vm.path = path.reduce((path, actorMovie) => path.concat(actorMovie), []);
		
		//remove the null placeholder for Kevin Bacon's movie
		vm.path = vm.path.slice(0, -1);


		$location.path(`/display/${vm.path[0].nconst}`).replace();
	});


	//no path found, either an error or multiple choices
	$scope.$on('reqError', (event, res) => {
		vm.inputDisabled = false;

		if (res.status === 300) {
			vm.choices = res.data;
			vm.view = 'choose'
			$location.path('/choose').replace();
		
		} else {
			vm.path = 'home';
			vm.error = res.status;
			$location.path('/home').replace();
		}
	});
}

export default AppController;

