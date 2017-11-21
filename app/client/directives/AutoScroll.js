/**
 *
 *  This is the directive used to scroll the display view automatically as actors/movies come into view. It is attached to the display content container div,
 *	which has a fixed height and scrolls on overflow. The display content container holds the display content div, which holds the actual row elements and 
 *	grows in height with no restriction.
 *
**/

import angular from 'angular';
import $ from 'jquery';


(() => {
	angular
		.module('app.autoScroll', [])
		.directive('autoScroll', [ '$timeout', $timeout => ($scope, $element, $attrs) => {
			
			const displayContainer = $('#' + $attrs.id);			// we use $.animate() on this element
			const displayContent = $element[0].children[0];

			// finds the index of the bottommost visible row in the display view
			const getBottomRowIndex = () => $scope
				.$eval('display.rows')
				.reduce((max, row, index) => (
					row.hidden ? max : Math.max(max, index)
				), 0);

			// scrolls display content container so that the bottom of the bottommost (nonhidden) row is just visible
			const animateScroll = bottomRowIndex => {
				const row = displayContent.children[bottomRowIndex];
				const scrollTo = row.offsetTop + row.scrollHeight - displayContainer[0].clientHeight;
								
				if (scrollTo > $element[0].scrollTop) {
					displayContainer.stop(true);
					displayContainer.animate({ scrollTop: scrollTo }, 900);
				}
			};

			// timeout to allow newly visible row to render
			$scope.$watch(getBottomRowIndex, index => $timeout(animateScroll.bind(null, index), 0));
		}]);
})();

