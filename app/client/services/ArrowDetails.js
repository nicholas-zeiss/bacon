/**
 * This service provides the various coordinates/data our arrow template requires for each arrow type
 **/


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
					x: 108,
					y: 140,
					anchor: 'middle'
				},
				title: {
					x: 0,
					y: 160,
					width: 216,
					height: 144,
					align: 'center'
				}
			});
		} else if (type == 'left') {
			Object.assign(out, {
				width: 248,
				height: 304,
				lineStart: {
					x: 243, 
					y: 152
				},
				lineEnd: {
					x: 12,
					y: 152
				},
				year: {
					x: 140,
					y: 140,
					anchor: 'middle'
				},
				title: {
					x: 32,
					y: 160,
					width: 216,
					height: 144,
					align: 'center'
				}
			});
		} else if (type == 'downOnLeft') {
			Object.assign(out, {
				width: 600,
				height: 240,
				lineStart: {
					x: 88, 
					y: 5
				},
				lineEnd: {
					x: 88,
					y: 228
				},
				year: {
					x: 100,
					y: 100,
					anchor: 'start'
				},
				title: {
					x: 100,
					y: 110,
					width: 400,
					height: 120,
					align: 'left'
				}
			});
		} else if (type == 'downOnRight') {
			Object.assign(out, {
				width: 600,
				height: 240,
				lineStart: {
					x: 512, 
					y: 5
				},
				lineEnd: {
					x: 512,
					y: 228
				},
				year: {
					x: 500,
					y: 100,
					anchor: 'end'
				},
				title: {
					x: 100,
					y: 110,
					width: 400,
					height: 120,
					align: 'right'
				}
			});
		} else if (type == 'leftCenter') {
			Object.assign(out, {
				width: 600,
				height: 240,
				lineStart: {
					x: 100, 
					y: 5
				},
				lineEnd: {
					x: 275,
					y: 228
				},
				year: {
					x: 110,
					y: 90,
					anchor: 'middle'
				},
				title: {
					x: 0,
					y: 100,
					width: 150,
					height: 140,
					align: 'right'
				}
			});
		} else if (type == 'rightCenter') {
			Object.assign(out, {
				width: 600,
				height: 240,
				lineStart: {
					x: 500, 
					y: 5
				},
				lineEnd: {
					x: 325,
					y: 228
				},
				year: {
					x: 490,
					y: 90,
					anchor: 'middle'
				},
				title: {
					x: 450,
					y: 100,
					width: 150,
					height: 140,
					align: 'left'
				}
			});
		}

		let width = out.lineEnd.x - out.lineStart.x;
		let height = out.lineStart.y - out.lineEnd.y;

		let theta = Math.atan(height / width);

		let sign = width >= 0 ? 1 : -1;

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

