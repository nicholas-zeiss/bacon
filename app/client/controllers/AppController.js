/**
 *
 *	This is our root level controller. It ensures that we are on the proper url and holds app level information
 *	such as the path to Kevin Bacon, if we are waiting on an http request, errors that need displaying, etc.
 *	It also handles all server activity.
 *
**/


function AppController($scope, $location, serverCalls) {	
	const vm = this;
	
	// vm.viewportWidth = document.getElementsByTagName('body')[0].clientWidth;

	// app wide state
	vm.pathToBacon = null;     // format [ actor1, movie1, ... , Kevin Bacon ]
	vm.choices = null;         // if user searches for a name with multiple matches hold matches here
	vm.serverError = null;
	vm.searchName = null;
	vm.inputDisabled = false;


	// start a search for an actor, term can either be a name or a nconst number
	// if replaceHistory is true the url the app was on when calling this will not be saved in browser history
	vm.search = function(term, replaceHistory) {
		vm.inputDisabled = true;
		vm.serverError = null;
		vm.searchName = (typeof term == 'number' ? 'index: ' : '') + term;

		const history = $location.path('/loading');

		if (replaceHistory) {
			history.replace();
		}

		if (typeof term == 'number') {
			serverCalls.getPathByNconst(term);
		} else {
			serverCalls.getPathByName(term);
		}
	};

	// user clicked the reset button in either the choose or display views
	vm.resetApp = function() {
		$location.path('/home');
	};

	// for clearing the home view of a 404 or server error
	vm.resetError = function() {
		vm.serverError = null;
		vm.searchName = null;
	};



	//-------------------------------------------------------------------
	//
	// 									Handlers for URL activity								
	//
	//-------------------------------------------------------------------

	const urlParser = /([a-z]+)\/?([a-zA-Z-]+)?([0-9]+)?$/;

	let rerouteOnLoad = false;
	
	// reroute as appropriate on reload
	if ($location.path() !== '/home') {
		const url = $location.path().match(urlParser);

		if (url && url[1] == 'display' && url[3]) {
			vm.search(Number(url[3]), true);
		
		} else if (url && url[1] == 'choose' && url[2]){
			vm.search(url[2].replace('-', ' '), true);
		
		} else {
			rerouteOnLoad = true;
			$location.path('/home').replace();
		}
	}

	// handles browser moving back/forward through history by prepping app state as appropriate
	$scope.$on('$locationChangeStart', (event, newUrl, prevUrl) => {
		
		// ignore url change on page load
		if (rerouteOnLoad) {
			rerouteOnLoad = false;
			return;
		}

		newUrl = newUrl.match(urlParser);
		prevUrl = prevUrl.match(urlParser);

		// prevent the user moving back/forward while a page is loading	
		if (prevUrl && newUrl && prevUrl[1] == 'loading' && newUrl[1] == 'home' && !vm.serverError) {
			event.preventDefault();

		// if this is the case url change is user activity not app activity
		} else if (prevUrl && newUrl && prevUrl[1] != 'loading' && newUrl[1] != 'loading') {			
			if (newUrl[1] == 'home') {
				vm.serverError = null;
				vm.inputDisabled = false;
			
			} else {
				vm.inputDisabled = true;

				if (newUrl[1] == 'choose' && (!vm.choices || newUrl[2].replace('-', ' ') != vm.choices[0].name)) {
					vm.search(newUrl[2].replace('-', ' '), true);	
				
				} else if (newUrl[1] == 'display' && (!vm.pathToBacon || newUrl[3] != vm.pathToBacon[0]._id)) {
					vm.search(Number(newUrl[3]), true); 
				}
			} 
		}
	});



	//-------------------------------------------------------------------
	//																								
	//  				Event Listeners for view component activity		
	//																								
	//-------------------------------------------------------------------

	// user requested a search through input
	$scope.$on('inputSubmission', (event, name) => vm.search(name, false));

	// triggered by user selecting an actor in the choice view
	$scope.$on('choiceMade', (event, nconst) => vm.search(nconst, false));

	// display loaded all of the path into the dom, enable input
	$scope.$on('unlockInput', () => vm.inputDisabled = false);



	//-------------------------------------------------------------------
	//
	//     						Event Listeners for server activity
	//
	//-------------------------------------------------------------------

	// path found, switch to Display view
	$scope.$on('reqSuccess', (event, path) => {
		// path returned by server is [{ actor: actor1Info, movie: movie1Info }, ... ], we must flatten it
		// last node.movie is null, so remove it
		vm.pathToBacon = path.reduce((path, node) => path.concat(node.actor, node.movie), []).slice(0, -1);		
		
		vm.pathToBacon.forEach((actor, i) => {
			if (!(i % 2)) {		// skip movies
				actor.imgUrl = actor.imgUrl ? actor.imgUrl : '/client/images/no-image.png';
			}
		});
		
		vm.searchName = null;
		
		$location
			.path(`/display/${vm.pathToBacon[0]._id}`)
			.replace();
	});

	// no path found, either an error or multiple choices
	$scope.$on('reqError', (event, res) => {
		if (res.status === 300) {
			vm.choices = res.data;
			
			$location
				.path(`/choose/${vm.choices[0].name.replace(' ', '-')}`)
				.replace();
		
		} else {
			vm.serverError = res.status;
			vm.inputDisabled = false;
			$location.path('/home').replace();
		}
	});
}


export default AppController;

