/**
 *
 *	This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 *	and must be shown to the user. Actor and movie information elements are added to DOM simultaneously and then made visible one by one.
 *	All nodes take a duration of vm.duration to have an opacity animation, nodes in the first row also take vm.duration to do a width
 *	animation beforehand. Total duration of each node becoming unhidden to next node starting its animation is 2 * vm.duration.
 *
 *	On loading of a new row jquery is used to scroll the display container to that position. User scrolling is disabled while this occurs.
 *
**/



function DisplayController($scope, $timeout, $window, arrowDetails, getNodeTypes) {
	const vm = this;
	
	vm.duration = 500;
	vm.rows = [];
	vm.userScrollLocked = true;

	// const device = $window.innerWidth < 800 ? 'small' : 'medium';
	const device = 'medium';
	const nodeToRowIndex = [];
	const nodeToIndexInRow = [];
	const nodeTypes = getNodeTypes(device, $scope.app.pathToBacon.length);
	const timeouts = [];


	// populate the rows to be displayed with the actor/movie nodes in the path to bacon
	$scope.app.pathToBacon.forEach((node, i) => {
		const rowIndex = getRowIndex(i);

		vm.rows[rowIndex] = vm.rows[rowIndex] || { hidden: true, nodes: [] };

		const rowNode = {
			actorMovie: node,
			hidden: true,
			short: /short/i.test(nodeTypes[i]),
			type: nodeTypes[i]
		};

		if (rowNode.type !== 'actor') {
			rowNode.arrowDetails = arrowDetails(rowNode.type);
		}

		const rowLength = vm.rows[rowIndex].nodes.push(rowNode);

		nodeToRowIndex[i] = rowIndex;
		nodeToIndexInRow[i] = rowLength - 1;
	});
	
	// make first actor node visible, initiating cascade, after a small delay to ensure image has loaded
	timeouts.push($timeout(showNode.bind(null, 0), 100));



	//-------------------------------------------------------------------
	// 															Helpers								
	//-------------------------------------------------------------------

	vm.reset = function() {
		timeouts.forEach(id => $timeout.cancel(id));
		$scope.app.resetApp();
	};
	

	function showNode(nodeIndex) {
		const rowIndex = nodeToRowIndex[nodeIndex];
		const indexInRow = nodeToIndexInRow[nodeIndex];

		vm.rows[rowIndex].hidden = false;
		vm.rows[rowIndex].nodes[indexInRow].hidden = false;

		if (nodeIndex < $scope.app.pathToBacon.length - 1) {
			timeouts.push($timeout(showNode.bind(null, nodeIndex + 1), 2 * vm.duration));
		} else {
			$scope.$emit('unlockInput');		// unlock user input to search bar
			vm.userScrollLocked = false;
		}
	}


	// different device sizes have different numbers of actors per row, get index here
	function getRowIndex(index) {
		const rowLength = device == 'small' ? 3 : 5;
		return 2 * Math.floor(index / (rowLength + 1)) + Math.floor((index % (rowLength + 1)) / rowLength);
	}
}


export default DisplayController;

