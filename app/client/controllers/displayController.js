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
	vm.timeoutPromises = [];
	
	vm.reseting = false;
	

	//called when user wishes to reset the app to the home page
	vm.reset = function() {
		vm.reseting = true;
		vm.timeoutPromises.forEach(promise => $timeout.cancel(promise));
		$scope.$emit('reset');
	}
	

	//called when an actor has loaded its image using the onload attribute provided by ngInclude,
	//or called manually when inserting a movie
	vm.actorMovieLoaded = function(index) {
		if (vm.reseting) {
			return;
		}

		vm.loading[index] = false;
		vm.timeoutPromises.push($timeout(() => scrollToNode('#node-' + index), 100));		//give it a moment to render into the dom

		if (index < $scope.app.path.length - 1) {
			vm.timeoutPromises.push($timeout(() => {
				vm.pathToBacon.push($scope.app.path[index + 1]);

				if (isMovie(index + 1)) {
					vm.actorMovieLoaded(index + 1);
				}
			}, 2 * vm.duration));

		} else {
			vm.timeoutPromises.push(
				$timeout(() => {
					$scope.$emit('displayFinishedLoading');
				}, 2 * vm.duration)
			);
		}
	}


	function scrollToNode(nodeId) {
		let scrollTo = $(nodeId);
		console.log(nodeId, scrollTo.offset().top + scrollTo.height())

		if (scrollTo.length) {
			$('#content').animate({
      	scrollTop: scrollTo.offset().top + scrollTo.height()
      }, 1000);
		}
	}

 
	function isMovie(index) {
		return !!(index % 2);
	}
}

export default DisplayController;

