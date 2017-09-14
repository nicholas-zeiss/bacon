/**
 * This controller is responsible for user input. It handles searches and subsequent requests to the server.
 */


import $ from 'jquery';


function InputController($scope, $timeout, serverCalls) {
	let vm = this;

	vm.name = '';
	vm.submit = submitName;

	//executes on user search
	function submitName() {
		if (vm.name) {
			//TODO - make this a directive
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
	}
}

export default InputController;

