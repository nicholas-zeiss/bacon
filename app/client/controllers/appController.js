/**
 * This is our root level controller. It ensures that we are on the proper url and holds app level information
 * such as the path to Kevin Bacon, if we are waiting on an http request, errors that need displaying, etc.
 */


function AppController($scope, $location, serverCalls) {	
	console.log('app loaded', Date.now())
	let vm = this;
	
	vm.path = null;      //path to Kevin Bacon, which is of format [ actor1, movie1, ... , Kevin Bacon ]
	vm.choices = null;   //if user searches for a name with multiple matches hold matches here
	vm.error = null;     //hold errors here
	vm.searchName = null;
	vm.inputDisabled = false;
	vm.view = 'home';		//tracked for generating an id on element containing the view


	const URL_PARSER = /([a-z]+)\/?([a-zA-Z-]+)?([0-9]+)?$/;


	//reroute as appropriate on reload
	if ($location.path() !== '/home') {
		$location.path('/home').replace();
		let url = $location.path().match(URL_PARSER);

		if (url && ((url[1] == 'display' && url[3]) || (url[1] == 'choose' && url[2]))) {
			vm.inputDisabled = true;

			if (url[1] == 'display') {
				vm.searchName = `index: ${url[3]}`;
				serverCalls.getPathByNconst(Number(url[3]));
			
			} else {
				vm.searchName = url[2].replace('-', ' ');
				serverCalls.getPathByName(vm.searchName);
			}

		} else {
			$location.path('/home').replace();
		}
	}


	/**	--------------------------------------------- *
	 *																								*
	 *     Event Listeners for activity in the		    *
	 *     						choose view											*
	 *																								*
	 * ---------------------------------------------- **/


	$scope.$on('choiceMade', (event, nconst) => {
		vm.inputDisabled = true;
		vm.view = 'loading';
		
		serverCalls.getPathByNconst(nconst);

		$location.path('/loading');
	});



	//handler for browser using back/forward through history
	//all urls are assumed to be valid as the app itself only produces valid urls
	//and manually loading a bad url is rerouted up above to /home
	//back/forward through a reload causes another reload
	$scope.$on('$locationChangeSuccess', (event, newUrl, prevUrl) => {
		console.log(prevUrl, newUrl);
		prevUrl = prevUrl.match(URL_PARSER);
	  newUrl = newUrl.match(URL_PARSER);
		
		if (newUrl[1] == 'home') {

		} else if (newUrl[1] == 'choose') {

		} else if (newUrl[1] == 'display') {

		} else if (newUrl[1] != 'loading') {
			// $location.path('home').replace();
		}
	});


	/**	--------------------------------------------- *
	 *																								*
	 *     Event Listeners for activity in the		    *
	 *     			  display/choose view									*
	 *																								*
	 * ---------------------------------------------- **/


	//user clicked the clear button, reset app 
	vm.reset = function() {
		vm.error = null;
		vm.searchName = null;
		vm.inputDisabled = false;
		vm.view = 'home';

		$location.path('/home');
	}


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
		vm.error = null;
		vm.searchName = name;
		vm.inputDisabled = true;
		vm.view = 'loading';
		
		$location.path('/loading');
	});


	//path found, switch to Display view
	$scope.$on('reqSuccess', (event, path) => {
		vm.path = path.reduce((path, actorMovie) => path.concat(actorMovie), []);
		
		//remove the null placeholder for Kevin Bacon's movie
		vm.path = vm.path.slice(0, -1);
		
		vm.searchName = null;
		vm.view = 'display';


		$location.path(`/display/${vm.path[0].nconst}`).replace();
	});


	//no path found, either an error or multiple choices
	$scope.$on('reqError', (event, res) => {
		vm.searchName = null;

		if (res.status === 300) {
			vm.choices = res.data;
			vm.view = 'choose';
			$location.path(`/choose/${vm.choices[0].name.replace(' ', '-')}`).replace();
		
		} else {
			vm.error = res.status;
			vm.inputDisabled = false;
			vm.view = 'home';
			$location.path('/home').replace();
		}
	});
}

export default AppController;

