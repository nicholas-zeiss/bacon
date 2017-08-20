/**
 * This is our root level controller. It ensures that we are on the proper url and holds app level information
 * such as the path to Kevin Bacon, if we are waiting on an http request, errors that need displaying, etc.
 * It also handles all server activity.
 */


function AppController($scope, $location, serverCalls) {	
	let vm = this;
	
	const URL_PARSER = /([a-z]+)\/?([a-zA-Z-]+)?([0-9]+)?$/;

	//these variables hold all stateful information for the app (not including the views)
	vm.pathToBacon = null;     //format [ actor1, movie1, ... , Kevin Bacon ]
	vm.choices = null;         //if user searches for a name with multiple matches hold matches here
	vm.serverError = null;
	vm.searchName = null;
	vm.inputDisabled = false;


	//start a search for an actor, term can either be a name or a nconst number
	//if replaceHistory is true the url the app was on when calling this will not be saved in browser history
	vm.search = function(term, replaceHistory) {
		vm.serverError = null;
		vm.searchName = (typeof term == 'number' ? 'index: ' : '') + term;
		vm.inputDisabled = true;

		let history = $location.path('/loading');

		if (replaceHistory) {
			history.replace();
		}

		if (typeof term == 'number') {
			serverCalls.getPathByNconst(term);
		} else {
			serverCalls.getPathByName(term);
		}
	}


	//user clicked the reset button in either the choose or display views
	vm.resetApp = function() {
		$location.path('/home');
	}


	//for clearing the home view of a 404 or server error
	vm.resetError = function() {
		vm.serverError = null;
		vm.searchName = null;
	}


  /**	--------------------------------------------- *
	 *																								*
	 *  				Handlers for URL activity							*
	 *																								*
	 * ---------------------------------------------- **/

	//reroute as appropriate on reload
	if ($location.path() !== '/home') {
		let url = $location.path().match(URL_PARSER);

		if (url && url[1] == 'display' && url[3]) {
			vm.search(Number(url[3]), true);
			
		} else if (url && url[1] == 'choose' && url[2]){
			vm.search(url[2].replace('-', ' '), true)

		} else {
			$location.path('/home').replace();
		}
	}


	//handles browser moving back/forward through history by prepping app state as appropriate
	$scope.$on('$locationChangeStart', (event, newUrl, prevUrl) => {
		prevUrl = prevUrl.match(URL_PARSER);
	  newUrl = newUrl.match(URL_PARSER);

		//prevent the user moving back/forward while a page is loading	
		if (prevUrl && newUrl && prevUrl[1] == 'loading' && newUrl[1] == 'home' && !vm.serverError) {
			event.preventDefault();

		//if this is the case url change is user activity not app activity
		} else if (prevUrl && newUrl && prevUrl[1] != 'loading' && newUrl[1] != 'loading') {			
			if (newUrl[1] == 'home') {
				vm.serverError = null;
				vm.inputDisabled = false;

			} else {
				vm.inputDisabled = true;

				if (newUrl[1] == 'choose' && (!vm.choices || newUrl[2].replace('-', ' ') != vm.choices[0].name)) {
					vm.search(param.replace('-', ' '), true);
				
				} else if (!vm.pathToBacon || newUrl[3] != vm.pathToBacon[0].nconst) {
					vm.search(Number(param), true); 
				}
			} 
		}
	});


	/**	--------------------------------------------- *
	 *																								*
	 *  Event Listeners for view component activity		*
	 *																								*
	 * ---------------------------------------------- **/


	//user requested a search through input
	$scope.$on('inputSubmission', (event, name) => {
		vm.search(name, false);
	});


	//triggered by user selecting an actor in the choice view
	$scope.$on('choiceMade', (event, nconst) => {
		vm.search(nconst, false);
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


	//path found, switch to Display view
	$scope.$on('reqSuccess', (event, path) => {
		//path returned by server is [[actor1, movie1], ... [Kevin Bacon, null]]
		vm.pathToBacon = path.reduce((path, actorMovie) => path.concat(actorMovie), []).slice(0, -1);		
		vm.searchName = null;

		$location.path(`/display/${vm.pathToBacon[0].nconst}`).replace();
	});


	//no path found, either an error or multiple choices
	$scope.$on('reqError', (event, res) => {
		if (res.status === 300) {
			vm.choices = res.data;
			$location.path(`/choose/${vm.choices[0].name.replace(' ', '-')}`).replace();
		
		} else {
			vm.serverError = res.status;
			vm.inputDisabled = false;
			$location.path('/home').replace();
		}
	});
}

export default AppController;

