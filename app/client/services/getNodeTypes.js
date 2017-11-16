/**
 *
 *  Given a device size and length of the path to bacon, return an array of types
 *  for each node in the path (actor or appropriate arrow for movies)
 *
**/


import angular from 'angular';


(() => {
	angular
		.module('app.getNodeTypes', [])
		.factory('getNodeTypes', () => {

			return (size, length) => size == 'small' ? small(length) : medium(length);

			function small(length) {
				let types = {
					3: [
						'actor',
						'rightShort',
						'actor'
					],
					5: [
						'actor',
						'rightShort',
						'actor',
						'rightCenter',
						'actor'
					],
					7: [
						'actor',
						'rightShort',
						'actor',
						'downOnRight',
						'actor',
						'leftShort',
						'actor'
					],
					9: [
						'actor',
						'rightShort',
						'actor',
						'downOnRight',
						'actor',
						'leftShort',
						'actor',
						'leftCenter',
						'actor'
					],
					11: [
						'actor',
						'rightShort',
						'actor',
						'downOnRight',
						'actor',
						'leftShort',
						'actor',
						'downOnLeft',
						'actor',
						'rightShort',
						'actor'
					],
					13: [
						'actor',
						'rightShort',
						'actor',
						'downOnRight',
						'actor',
						'leftShort',
						'actor',
						'downOnLeft',
						'actor',
						'rightShort',
						'actor',
						'rightCenter',
						'actor'
					]
				};

				return types[length];
			}


			function medium(length) {
				let types = {
					3: [
						'actor',
						'right',
						'actor'
					],
					5: [
						'actor',
						'rightShort',
						'actor',
						'rightShort',
						'actor'
					],
					7: [
						'actor',
						'rightShort',
						'actor',
						'rightShort',
						'actor',
						'rightCenterLong',
						'actor'
					],
					9: [
						'actor',
						'rightShort',
						'actor',
						'rightShort',
						'actor',
						'rightCenterShort',
						'actor',
						'leftShort',
						'actor'
					],
					11: [
						'actor',
						'rightShort',
						'actor',
						'rightShort',
						'actor',
						'downOnRight',
						'actor',
						'leftShort',
						'actor',
						'leftShort',
						'actor'
					],
					13: [
						'actor',
						'rightShort',
						'actor',
						'rightShort',
						'actor',
						'downOnRight',
						'actor',
						'leftShort',
						'actor',
						'leftShort',
						'actor',
						'leftCenterLong',
						'actor'
					]
				};

				return types[length];
			}
			
		});
})();

