

function InputController($scope, serverCalls) {
	let vm = this;

	vm.name = '';
	vm.submit = submitName;

	//TODO special case for kevin bacon
	function submitName() {
		loadingStart();
		serverCalls.getPathByName(vm.name, loadingComplete, loadingFailed);
		// vm.name = '';
	}

	function loadingStart() {
		$scope.$emit('reqStarted');
	}

	function loadingComplete(response) {
		let path = response.data;

		let actors = [];

		path.forEach(actorMovie => {
			// if (!actorMovie[0].url) {
				actors.push({
					name: actorMovie[0].name,
					nconst: actorMovie[0].nconst
				});
			// }
		});

		// console.log(actors);

		serverCalls.getImages(actors,
			res => {
				let imageUrls = res.data;

				// console.log(imageUrls);

				path.forEach(actorMovie => {
					// actorMovie[0].url = imageUrls[actorMovie[0].name] || actorMovie[0].url;
					actorMovie[0].url = imageUrls[actorMovie[0].name];
				});

				$scope.$emit('reqSuccess', path);
			},
			error => {
				loadingFailed(error);
			}
		);
	}

	function loadingFailed(response) {
		$scope.$emit('reqError', response)
	}
}

export default InputController;