(function() {
	'use strict';

	angular.module('skyCrop').directive('skyCropSrc', skyCropSrcDirective);

	skyCropSrcDirective.$inject = ['skyCrop','$rootScope'];
	function skyCropSrcDirective(skyCrop: sky.ISkyCropService, $rootScope:ng.IRootScopeService) {
		var directive = {
			restrict: 'A',
			link: link
		};

		function link(scope, element, attrs) {

			var masterElement  = (element[0].tagName === 'IMG') ? angular.element(element).parent()[0] : element[0];
			var orgImageSize;

			attrs.$observe('skyCropSrc', function(value) {
				if (value) {
					orgImageSize = skyCrop.infoFromSrc(attrs.skyCropSrc);

					// Add listeners
					element.on('skyCrop:resize', () => update(value));
					$rootScope.$on('skyCrop:resize', () => update(value));

					// Start out
					update(value);	
				}
			});

			function update(value) {
				setSrc(skyCrop.getUrl(value.slice(0, value.indexOf('?')), orgImageSize, { width: masterElement.clientWidth, height: masterElement.clientHeight }, attrs.skyCropMode, attrs.skyCropRound));
			}

			function setSrc(url) {
				if (element[0].tagName === 'IMG') {
					attrs.$set('src', url);
					element.prop('src', url);
				} else {
					element[0].style.backgroundImage = 'url('+url+')';
					
					var anchor = skyCrop.anchorFromSrc(url);
					element[0].style.backgroundPosition = anchor.x + ' ' + anchor.y;
				}				
			}
			
		}

		return directive;
	}
	









})();