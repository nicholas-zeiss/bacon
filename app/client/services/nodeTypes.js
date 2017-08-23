/**
 * Given a device size and length of the path to bacon, return an array of types
 * for each node in the path (actor or appropriate arrow for movies)
 */


import angular from 'angular';


(() => {
	angular.module('app.nodeTypes', [])
	.factory('nodeTypes', () => {


		function small(length) {
			let types = [
				3: [
					'actor',
					'right',
					'actor'
				],
				5: [
					'actor',
					'right',
					'actor',
					'rightCenter',
					'actor'
				],
				7: [
					'actor',
					'right',
					'actor',
					'downOnRight',
					'actor',
					'left',
					'actor'
				],
				9: [
					'actor',
					'right',
					'actor',
					'downOnRight',
					'actor',
					'left',
					'actor',
					'leftCenter',
					'actor'
				],
				11: [
					'actor',
					'right',
					'actor',
					'downOnRight',
					'actor',
					'left',
					'actor',
					'downOnLeft',
					'actor',
					'right',
					'actor'
				],
				13: [
					'actor',
					'right',
					'actor',
					'downOnRight',
					'actor',
					'left',
					'actor',
					'downOnLeft',
					'actor',
					'right',
					'actor',
					'rightCenter',
					'actor'
				]
			];

			return types[length];
		}


		function medium(length) {
			let types = [
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
					'actor'
					'rightCenterLong',
					'actor'
				],
				9: [
					'actor',
					'rightShort',
					'actor',
					'rightShort',
					'actor'
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
					'actor'
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
					'actor'
					'downOnRight',
					'actor',
					'leftShort',
					'actor',
					'leftShort',
					'actor',
					'leftCenterLong',
					'actor'
				]
			];

			return types[length];
		}


		function large(length) {
let types = [
				3: [
					'actor',
					'right',
					'actor'
				],
				5: [
					'actor',
					'right',
					'actor',
					'right',
					'actor'
				],
				7: [
					'actor',
					'curvedTop',
					'actor',
					'curvedTop',
					'actor',
					'curvedBottom',
					'actor'
				],
				9: [
					'actor',
					'curvedTop',
					'actor',
					'curvedTop',
					'actor',
					'curvedBottom',
					'actor'
					'up',
					'actor'
				],
				11: [
					'actor',
					'curvedTop',
					'actor',
					'curvedTop',
					'actor',
					'curvedBottom',
					'actor'
					'curvedBottom',
					'actor'
					'upRight',
					'actor'
				],
				13: [
					'actor',
					'curvedTop',
					'actor',
					'curvedTop',
					'actor',
					'curvedTop',
					'actor'
					'curvedBottom',
					'actor'
					'curvedBottom',
					'actor',
					'upRight',
					'actor'
				]
			];

			return types[length];
		}


		return (size, length) => {
			if (size == 'small') {
				return small(length);
			} else if (size == 'medium') {
				return medium(length);
			} else {
				return large(length);
			}
		};
		
	});
})();

