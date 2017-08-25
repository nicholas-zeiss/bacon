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
	let nodeType = nodeTypes(device, $scope.app.pathToBacon.length);
	let nodeRowIndex = [];


	vm.duration = 500;							//IMPT if you change this also change values in display.css
	vm.rows = [];
	vm.rowHidden = [];


	$scope.app.pathToBacon.forEach((node, i) => {
		let type = nodeType[i];
		let row = getRowIndex(i);

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
		reseting = true;
		timeoutPromises.forEach(promise => $timeout.cancel(promise));
		$scope.app.resetApp();
	}
	

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
			$scope.$broadcast('scrollable')
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


	function largeRowIndex(index) {
		
	}


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

