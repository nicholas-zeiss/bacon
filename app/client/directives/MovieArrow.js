/**
 * This is the directive used to create movie arrows
 */

import angular from 'angular';


(() => {
 	angular.module('app.movieArrow', [])
 	.directive('movieArrow', () => ($scope, $element, $attrs) => {		

		if ($attrs.movieArrow == 'right') {
 			let svg = document.getElementById('right-arrow').cloneNode(true);
 			svg.removeAttribute('id');
 			svg.removeAttribute('style');

			
			svg.appendChild(createTextNode($attrs.year, '90', '15'));
			svg.appendChild(createForeignPNode($attrs.movieTitle, '0', '40'));

			$element.append(svg);
		}


		function createTextNode(text, x, y) {
			let node = document.createElementNS('http://www.w3.org/2000/svg','text');

			node.setAttribute('x', x);
			node.setAttribute('y', y);
			node.setAttribute('text-anchor', 'middle');

			node.innerHTML = text;

			return node;
		}


		function createForeignPNode(text, x, y) {
			let node = document.createElementNS('http://www.w3.org/2000/svg','foreignObject');
			let p = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');

			node.setAttribute('x', x);
			node.setAttribute('y', y);
			node.setAttribute('width', '180');
			node.setAttribute('height', '110');


			p.innerHTML = text;

			node.appendChild(p);

			return node;
		}
 	});
 })();

