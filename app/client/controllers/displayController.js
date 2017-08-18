/**
 * This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 * and must be shown to the user. Actor and movie information nodes are inserted into the DOM one by one and on insert
 * go through two animations of length vm.duration, and are scrolled to using jquery.
 */

import $ from 'jquery';


function DisplayController($scope, $timeout) {
	let vm = this;

	//IMPT if you change this also change values in display.css
	vm.duration = 500;

	vm.pathToBacon = [$scope.app.path[0]];

	//actors can have images, we need to wait for them to load their image before animating their insertion
	vm.loading = {};
	
	$scope.app.path.forEach((actorMovie, i) => vm.loading[i] = true);

	//we need to clear these if display is closed before finished loading actors/movies
	let timeoutPromises = [];
	let reseting = false;
	

	//called when user wishes to reset the app to the home page
	vm.reset = function() {
		reseting = true;
		timeoutPromises.forEach(promise => $timeout.cancel(promise));
		$scope.app.reset();
	}
	

	//called when an actor has loaded its image using the onload attribute provided by ngInclude,
	//or called manually when inserting a movie
	vm.actorMovieLoaded = function(index) {
		if (reseting) {
			return;
		}

		vm.loading[index] = false;

		timeoutPromises.push($timeout(() => scrollToNode('#node-' + index), 100));		//give it a moment to render into the dom

		if (index < $scope.app.path.length - 1) {
			timeoutPromises.push($timeout(() => {
				vm.pathToBacon.push($scope.app.path[index + 1]);

				if (isMovie(index + 1)) {
					vm.actorMovieLoaded(index + 1);
				}
			}, 2 * vm.duration));

		} else {
			timeoutPromises.push(
				$timeout(() => {
					$scope.$emit('displayFinishedLoading');
				}, 2 * vm.duration)
			);
		}
	}

 
	function isMovie(index) {
		return !!(index % 2);
	}

	let lastScrollPos = 0;


	function scrollToNode(nodeId) {
		let node = $(nodeId);

		//to prevent forward/back through browser history erros
		if (!node.length) {
			return;
		}

		let scrollTo = node.position().top + node.height();

		if (scrollTo > lastScrollPos) {
			lastScrollPos = scrollTo;

			$('#display-content-container').animate({
      	scrollTop: scrollTo
      }, 1000);
		}
	}
}

export default DisplayController;

