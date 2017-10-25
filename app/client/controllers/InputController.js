/**
 *
 *  This controller is responsible for user input. It handles searches and subsequent requests to the server.
 *
**/


import $ from 'jquery';


function InputController($scope, $timeout) {
	let vm = this;

	// name to be searched for
	vm.name = '';

	// executes on user search
	vm.submit = function() {
		if (vm.name) {
			// searching for kevin bacon on homepage has small easter egg
			if (/kevin\sbacon/i.test(vm.name)) {
				let bacon = $('#home-bacon-img');

				if (bacon.length && !bacon.attr('class').includes('toggle')) {
					bacon.addClass('toggle');
					
					$timeout(() => {
						if (bacon.length) {
							bacon.removeClass('toggle');
						}
					}, 5200);
				}

			} else {
				$scope.$emit('inputSubmission', vm.name);
			}

			vm.name = '';
		}
	};
}


export default InputController;

