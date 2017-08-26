


import angular from 'angular';

(() => {
	angular.module('app.arrowDetails', [])
	.factory('arrowDetails', () => type => {
		let out = {};

		if (type == 'right') {
			Object.assign(out, {
				width: 248,
				height: 304,
				lineStart: {
					x: 5, 
					y: 152
				},
				lineEnd: {
					x: 236,
					y: 152
				},
				year: {
					x: 110,
					y: 140
				},
				title: {
					x: 0,
					y: 160,
					width: 220,
					height: 144,
					align: 'center'
				}
			});
		}

		let width = out.lineEnd.x - out.lineStart.x;
		let height = out.lineStart.y - out.lineEnd.y;

		let theta = Math.atan(height / width);

		let sign = width > 0 ? 1 : -1;

		return Object.assign(out, {
			tipPoints: [
				out.lineEnd.x - 28.28 * sign * Math.cos(theta + Math.PI / 4),
				out.lineEnd.y + 28.28 * sign * Math.sin(theta + Math.PI / 4),
				out.lineEnd.x,
				out.lineEnd.y,
				out.lineEnd.x - 28.28 * sign * Math.sin(theta + Math.PI / 4),
				out.lineEnd.y - 28.28 * sign * Math.cos(theta + Math.PI / 4)
			].join(' ')
		});
	});
})();

