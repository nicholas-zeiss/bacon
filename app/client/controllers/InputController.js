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
			const name = vm.name
				.replace(/^\s+|\s+$/g, '')
				.replace(/\s+/g, ' ');

			// searching for kevin bacon on homepage has small easter egg
			if (/kevin\s+bacon/i.test(name)) {
				const bacon = $('#home-bacon-img');

				if (bacon.length && !bacon.attr('class').includes('toggle')) {
					bacon.addClass('toggle');
					
					$timeout(() => {
						if (bacon.length) {
							bacon.removeClass('toggle');
						}
					}, 2700);
				}
			} else {
				$scope.$emit('inputSubmission', name);
			}

			vm.name = '';
		}
	};
}


export default InputController;

