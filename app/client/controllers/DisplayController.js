/**
 *
 *	This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 *	and must be shown to the user. Actor and movie information elements are added to DOM simultaneously and then made visible one by one.
 *	All nodes take a duration of vm.duration to have an opacity animation, nodes in the first row also take vm.duration to do a width
 *	animation beforehand.
 *
 *	On loading of a new row jquery is used to scroll the display container to that position. User scrolling is disabled while this occurs.
 *
**/


import $ from 'jquery';


function DisplayController($scope, $timeout, $window, nodeTypes) {
	let vm = this;

	let lastScrollPos = 0;					// current scrollTop of the #display-content-container element
	let timeoutPromises = [];				// unresolved timeouts that need to be cleared when we exit this view
	
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
		let rowIndex = getRowIndex(i);				// get corresponding row index, depends on device size

		vm.rows[rowIndex] = vm.rows[rowIndex] || [];
		vm.rowHidden[rowIndex] = true;

		let length = vm.rows[rowIndex].push({
			actorMovie: node,
			hidden: true,
			type: nodeType[i]
		});

		nodeRowIndex[i] = [rowIndex, length - 1];
	});


	vm.reset = function() {
		timeoutPromises.forEach(promise => $timeout.cancel(promise));
		$scope.app.resetApp();
	};
	

	// make first actor node visible, initiating cascade
	// small timeout to ensure image has loaded
	timeoutPromises.push($timeout(showNodes.bind(null, 0), 100));


	function showNodes(index) {
		let [ rowIndex, indexInRow ] = nodeRowIndex[index];

		if (vm.rowHidden[rowIndex]) {
			timeoutPromises.push($timeout(scrollToNode.bind(null, '#row-' + rowIndex), 100));
		}

		vm.rowHidden[rowIndex] = false;
		vm.rows[rowIndex][indexInRow].hidden = false;

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

