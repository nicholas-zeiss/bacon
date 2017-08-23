/**
 * This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 * and must be shown to the user. Actor and movie information nodes are inserted into the DOM one by one and on insert
 * go through two animations of length vm.duration, and are scrolled to using jquery.
 */

import $ from 'jquery';


function DisplayController($scope, $timeout, $window, nodeTypes) {
	let vm = this;

	let timeoutPromises = [];				//unresolved timeouts need to be cleared on reset
	let reseting = false;
	let lastScrollPos = 0;					//current scrollTop of the #display-content-container element
	let device = $window.innerWidth < 1000 ? $window.innerWidth < 800 ? 'small' : 'medium' : 'large';


	vm.duration = 500;							//IMPT if you change this also change values in display.css
	vm.loading = {};								//actor nodes need to load images and we need to track if they are loaded
	vm.pathToBacon = [$scope.app.pathToBacon[0]];
	vm.nodeType = [];



	$scope.app.pathToBacon.forEach((actorMovie, index, arr) => {
		vm.loading[index] = true

	});	


	vm.reset = function() {
		reseting = true;
		timeoutPromises.forEach(promise => $timeout.cancel(promise));
		$scope.app.resetApp();
	}
	

	//called when an actor has loaded its image using the onload attribute provided by ngInclude,
	//or called manually when inserting a movie
	vm.actorMovieLoaded = function(index) {
		if (reseting) {
			return;
		}

		vm.loading[index] = false;

		// timeoutPromises.push($timeout(() => scrollToNode('#node-' + index), 100));		//give it a moment to render into the dom


		if (index < $scope.app.pathToBacon.length - 1) {
			timeoutPromises.push($timeout(() => {
				let next;

				if(isMovie(index + 1)) {
					next = { movie: $scope.app.pathToBacon[index + 1], arrow: 'right'};
				}	else {
					next = { actor: $scope.app.pathToBacon[index + 1] };
				}

				vm.pathToBacon.push(next);

				if (isMovie(index + 1)) {
					vm.actorMovieLoaded(index + 1);
				}
			}, 2 * vm.duration + 100));

		} else {
			timeoutPromises.push(
				$timeout(() => {
					$scope.$emit('displayFinishedLoading');
				}, 2 * vm.duration + 100));
		}
	}


	//helpers for vm.actorMovieLoaded
	function scrollToNode(nodeId) {
		let node = $(nodeId);

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

 
	function isMovie(index) {
		return !!(index % 2);
	}
}

export default DisplayController;

