/**
 *
 * This is controller is responsible for the Choose view which occurs when the user searches
 * an ambiguous name.
 *
**/


function ChooseController($scope) {
	let vm = this;

	vm.makeChoice = function(nconst) {
		$scope.$emit('choiceMade', nconst);
	};
}


export default ChooseController;

