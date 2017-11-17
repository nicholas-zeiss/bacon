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


function DisplayController($scope, $timeout, $window, getNodeTypes) {
	const vm = this;

	vm.rows = [];
	vm.duration = 500;

	// maps each node by its index in pathToBacon to [ rowIndex, indexInRow ]
	const nodeRowIndex = [];
	const device = $window.innerWidth < 800 ? 'small' : 'medium';
	const nodeTypes = getNodeTypes(device, $scope.app.pathToBacon.length);
	const timeouts = [];
	let scrollPos = 0;


	// populate the rows to be displayed with the actor/movie nodes in the path to bacon
	$scope.app.pathToBacon.forEach((node, i) => {
		const rowIndex = getRowIndex(i);

		vm.rows[rowIndex] = vm.rows[rowIndex] || { hidden: true, nodes: [] };

		const rowLength = vm.rows[rowIndex].nodes.push({
			actorMovie: node,
			hidden: true,
			short: /short/i.test(nodeTypes[i]),
			type: nodeTypes[i]
		});

		nodeRowIndex[i] = [ rowIndex, rowLength - 1 ];
	});

	// make first actor node visible, initiating cascade, after a small delay to ensure image has loaded
	timeouts.push($timeout(showNode.bind(null, 0), 100));



	//-------------------------------------------------------------------
	// 															Helpers								
	//-------------------------------------------------------------------

	vm.reset = function() {
		timeouts.forEach(timeout => $timeout.cancel(timeout));
		$scope.app.resetApp();
	};
	

	function showNode(index) {
		const [ rowIndex, indexInRow ] = nodeRowIndex[index];

		if (vm.rows[rowIndex].hidden) {
			vm.rows[rowIndex].hidden = false;
			timeouts.push($timeout(scrollToRow.bind(null, '#row-' + rowIndex), 0));
		}

		vm.rows[rowIndex].nodes[indexInRow].hidden = false;

		if (index < nodeRowIndex.length - 1) {
			timeouts.push($timeout(showNode.bind(null, index + 1), 2 * vm.duration + 100));
		} else {
			$scope.$emit('unlockInput');						// unlock user input
			$scope.$broadcast('unlockScroll');			// unfreeze user scroll
		}
	}


	// different device sizes have different numbers of actors per row, get index here
	function getRowIndex(index) {
		const rowLength = device == 'small' ? 3 : 5;
		return 2 * Math.floor(index / (rowLength + 1)) + Math.floor((index % (rowLength + 1)) / rowLength);
	}


	const container = $('#display-content-container');

	// use jquery to scroll to a row
	function scrollToRow(rowID) {
		const row = $(rowID);
		const scrollTo = row[0].offsetTop + row.height() - container.innerHeight();

		if (scrollTo > scrollPos) {
			scrollPos = scrollTo;
			container.animate({ scrollTop: scrollTo }, 900);
		}
	}
}


export default DisplayController;

