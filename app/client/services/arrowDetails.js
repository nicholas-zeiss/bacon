/**
 *
 *  This service provides the various coordinates/data our arrow svg template requires for each arrow type
 *
**/


import angular from 'angular';

(() => {
	angular
		.module('app.arrowDetails', [])
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
					},
					style: {}
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
					},
					style: {}
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
					},
					style: {}
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
					},
					style: { float: 'right' }
				});


			} else if (type == 'leftCenter') {
				Object.assign(out, {
					width: 600,
					height: 240,
					lineStart: {
						x: 176, 
						y: 5
					},
					lineEnd: {
						x: 275,
						y: 228
					},
					year: {
						x: 180,
						y: 90,
						anchor: 'middle'
					},
					title: {
						x: 60,
						y: 100,
						width: 150,
						height: 140,
						align: 'right'
					},
					style: {}
				});


			} else if (type == 'rightCenter') {
				Object.assign(out, {
					width: 600,
					height: 240,
					lineStart: {
						x: 424, 
						y: 5
					},
					lineEnd: {
						x: 325,
						y: 228
					},
					year: {
						x: 420,
						y: 90,
						anchor: 'middle'
					},
					title: {
						x: 395,
						y: 100,
						width: 150,
						height: 140,
						align: 'left'
					},
					style: {}
				});


			} else if (type == 'leftShort') {
				Object.assign(out, {
					width: 136,
					height: 304,
					lineStart: {
						x: 131, 
						y: 152
					},
					lineEnd: {
						x: 12,
						y: 152
					},
					year: {
						x: 84,
						y: 140,
						anchor: 'middle'
					},
					title: {
						x: 32,
						y: 160,
						width: 104,
						height: 144,
						align: 'center'
					},
					style: {}
				});


			} else if (type == 'rightShort') {
				Object.assign(out, {
					width: 136,
					height: 304,
					lineStart: {
						x: 5, 
						y: 152
					},
					lineEnd: {
						x: 124,
						y: 152
					},
					year: {
						x: 52,
						y: 140,
						anchor: 'middle'
					},
					title: {
						x: 0,
						y: 160,
						width: 104,
						height: 144,
						align: 'center'
					},
					style: {}
				});


			} else if (type == 'leftCenterLong') {
				Object.assign(out, {
					width: 800,
					height: 240,
					lineStart: {
						x: 176, 
						y: 5
					},
					lineEnd: {
						x: 325,
						y: 228
					},
					year: {
						x: 190,
						y: 80,
						anchor: 'middle'
					},
					title: {
						x: 0,
						y: 90,
						width: 225,
						height: 140,
						align: 'right'
					},
					style: {}
				});


			} else if (type == 'rightCenterShort') {
				Object.assign(out, {
					width: 800,
					height: 240,
					lineStart: {
						x: 675, 
						y: 5
					},
					lineEnd: {
						x: 575,
						y: 228
					},
					year: {
						x: 675,
						y: 80,
						anchor: 'middle'
					},
					title: {
						x: 650,
						y: 90,
						width: 150,
						height: 150,
						align: 'left'
					},
					style: {}
				});


			} else if (type == 'rightCenterLong') {
				Object.assign(out, {
					width: 800,
					height: 240,
					lineStart: {
						x: 624, 
						y: 5
					},
					lineEnd: {
						x: 475,
						y: 228
					},
					year: {
						x: 610,
						y: 80,
						anchor: 'middle'
					},
					title: {
						x: 575,
						y: 90,
						width: 225,
						height: 140,
						align: 'left'
					},
					style: {}
				});
			}


			let width = out.lineEnd.x - out.lineStart.x;
			let height = out.lineStart.y - out.lineEnd.y;
			let theta = Math.atan(height / width);
			let sign = width >= 0 ? 1 : -1;


			// uses some trig to calc the coordinates of points in the arrow tip depending
			// on the direction of the arrow
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

