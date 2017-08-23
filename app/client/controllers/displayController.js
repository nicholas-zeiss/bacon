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
	let baconPathIndex = 0;
	let device = $window.innerWidth < 1000 ? $window.innerWidth < 800 ? 'small' : 'medium' : 'large';


	vm.duration = 500;							//IMPT if you change this also change values in display.css
	vm.rows = [[{ type: 'actor', loading: true, actor: $scope.app.pathToBacon[0] }]];
	vm.nodeType = nodeTypes(device, $scope.app.pathToBacon.length);


	vm.reset = function() {
		reseting = true;
		timeoutPromises.forEach(promise => $timeout.cancel(promise));
		$scope.app.resetApp();
	}
	

	//called when an actor has loaded its image using the onload attribute provided by ngInclude,
	//or called manually when inserting a movie
	vm.nodeLoaded = function() {
		if (reseting) {
			return;
		}

		let currRow = getRowIndex(baconPathIndex);
		let duration = currRow == 0 ? 2 * vm.duration : vm.duration;

		vm.rows[currRow][vm.rows[currRow].length - 1].loading = false;

		//if not last node
		if (baconPathIndex++ < $scope.app.pathToBacon.length - 1) {
			timeoutPromises.push($timeout(() => {
				let row = getRowIndex(baconPathIndex);
				let type = vm.nodeType[baconPathIndex];

				vm.rows[row] = vm.rows[row] || [];

				if (type == 'actor') {
					vm.rows[row].push({ type: type, loading: true, actor: $scope.app.pathToBacon[baconPathIndex] });

				} else {
					vm.rows[row].push({ type: type, loading: true, movie: $scope.app.pathToBacon[baconPathIndex] });					
					vm.nodeLoaded();
				}
			}, duration + 100));

		} else {
			console.log('finished\n', vm.rows);
			timeoutPromises.push(
				$timeout(() => {
					$scope.$emit('displayFinishedLoading');
				}, duration + 100));
		}
	}


	//where index references pathToBacon not rows
	function getRowIndex(index) {
		if (device == 'small') {
			return 2 * Math.floor(index / 4) + Math.floor((index % 4) / 3);
		} else if (device == 'medium') {
			return 2 * Math.floor(index / 6) + Math.floor((index % 6) / 5);
		} else {
			return largeRowIndex(index);
		}
	}


	function mediumRowIndex(index) {
		
	}


	function largeRowIndex(index) {
		
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

