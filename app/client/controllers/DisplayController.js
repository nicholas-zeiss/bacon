/**
 *
 *	This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 *	and must be shown to the user. Actor and movie information elements are loaded simultaneously and then made visible in the DOM one by one.
 *	All nodes take a duration of vm.duration to have an opacity animation, nodes in the first row also take vm.duration to do a width
 *	animation before hand.
 *
 *	On loading of a new row jquery is used to scroll the display container to that position. User scrolling is disabled while this occurs.
 *
**/


import $ from 'jquery';


function DisplayController($scope, $timeout, $window, nodeTypes) {
	let vm = this;

	let lastScrollPos = 0;					// current scrollTop of the #display-content-container element
	let timeoutPromises = [];				// unresolved timeouts that need to be cleared on reset
	
	// maps each actor/movie by its index in pathToBacon to [ rowIndex, indexInRow ], specifiying its row in vm.rows and 
	// the actor/movie's index in that row
	let nodeRowIndex = [];				
	
	// depending on device size and number of actors to display, we use different svg arrows to show the connections graphically
	// which arrows those are is determined here
	let device = $window.innerWidth < 800 ? 'small' : 'medium';
	let nodeType = nodeTypes(device, $scope.app.pathToBacon.length);


	// Actors are displayed across several rows, each row stored in rows. Booleans of whether 
	// a row is hidden or not are stored in rowHidden
	vm.rows = [];
	vm.rowHidden = [];
	vm.duration = 500;		// IMPT if you change this also change values in display.css


	$scope.app.pathToBacon.forEach((node, i) => {
		let type = nodeType[i];
		let row = getRowIndex(i);				// get corresponding row index, depends on device size

		vm.rows[row] = vm.rows[row] || [];
		vm.rowHidden[row] = true;

		let length = vm.rows[row].push({
			type: type,
			hidden: true,
			actorMovie: node
		});

		nodeRowIndex[i] = [row, length - 1];
	});


	vm.reset = function() {
		timeoutPromises.forEach(promise => $timeout.cancel(promise));
		$scope.app.resetApp();
	};
	

	// make first actor node visible, initiating cascade
	timeoutPromises.push($timeout(showNodes.bind(null, 0), 100));


	function showNodes(index) {
		let [ row, rowPos ] = nodeRowIndex[index];

		if (vm.rowHidden[row]) {
			timeoutPromises.push($timeout(scrollToNode.bind(null, '#row-' + row), 100));
		}

		vm.rowHidden[row] = false;
		vm.rows[row][rowPos].hidden = false;

		if (index < nodeRowIndex.length - 1) {
			timeoutPromises.push($timeout(showNodes.bind(null, index + 1), 2 * vm.duration + 100));
		} else {
			$scope.$emit('displayFinishedLoading');
			$scope.$broadcast('scrollable');
		}
	}


	// different device sizes have different numbers of actors per row, get index here
	function getRowIndex(index) {
		if (device == 'small') {
			return 2 * Math.floor(index / 4) + Math.floor((index % 4) / 3);
		} else if (device == 'medium') {
			return 2 * Math.floor(index / 6) + Math.floor((index % 6) / 5);
		} else {
			// return largeRowIndex(index);
		}
	}


	// use jquery to scroll to a row
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
			}, 900);
		}
	}
}


export default DisplayController;

