/**
 * This is controller is responsible for the Display view which occurs when a path to Kevin Bacon has been loaded
 * and must be shown to the user.
 */

import $ from 'jquery';


function DisplayController($scope, $timeout, $location, $route) {
	let vm = this;

	vm.path = [$scope.app.path[0]];
	// vm.pathIndex = 0;

	vm.loading = {};
	vm.finishedLoading = false;
	
	$scope.app.path.forEach((actorMovie, i) => vm.loading[i] = true);

	//used to keep track of promises we need to clear if display is closed before finished loading
	vm.timeoutPromises = [];
	vm.reseting = false;

	vm.currentUrl = $location.path();
	vm.currentRoute = $route.current;


	//prevent page reload when $location.hash is altered in vm.loaded
	$scope.$on('$locationChangeSuccess', event => {
		if (vm.currentUrl == $location.path()) {
			$route.current = vm.currentRoute;
		}
	});
	

	vm.reset = function() {
		vm.reseting = true;
		vm.timeoutPromises.forEach(promise => $timeout.cancel(promise));
		$scope.$emit('reset');
	}
	

	vm.loaded = function(index) {
		if (vm.reseting) {
			return;
		}

		vm.loading[index] = false;

		if (++index < $scope.app.path.length) {
			vm.timeoutPromises.push(
				$timeout(() => scrollToHash('#node-' + (index - 1)), 600),
				$timeout(() => {
					vm.path.push($scope.app.path[index]);

					//if pathIndex is odd it points to a movie-node and we need to call vm.loaded manually
					if (index % 2) {
						vm.loaded(index);
					}
				}, 1250)
			);

		} else {
			// $location.hash('node-' + (index - 1));

			vm.timeoutPromises.push(
				$timeout(() => scrollToHash('#node-' + (index - 1)), 600),
				$timeout(() => {
					vm.finishedLoading = true;
					$scope.$emit('displayFinishedLoading');
				}, 1250)
			);
		}
	}

	function scrollToHash(hash) {
		console.log('scrollToHash ', hash)
		let scrollTo = $(hash);
		console.log(scrollTo, scrollTo.length);
		if (scrollTo.length) {
			$('#content').animate({
      	scrollTop: scrollTo.offset().top + 50
      }, 1000);
		}
	}

}

export default DisplayController;

