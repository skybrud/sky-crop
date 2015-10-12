(function() {
	'use strict';

	angular.module('skyCrop').directive('skyCropObj', skyCropObjDirective);

	skyCropObjDirective.$inject = ['skyCrop', '$rootScope'];
	function skyCropObjDirective(skyCrop: sky.ISkyCropService, $rootScope:ng.IRootScopeService) {
		var directive = {
			restrict: 'A',
			link: link
		};

		function link(scope, element, attrs) {

			var masterElement  = (element[0].tagName === 'IMG') ? angular.element(element).parent()[0] : element[0];
			var orgImageSize;

			attrs.$observe('skyCropObj', function(value) {
				if (value) {
					var obj = JSON.parse(value);

					orgImageSize = {
						width: obj.properties.filter(prop => prop.alias === 'umbracoWidth')[0].value,
						height: obj.properties.filter(prop => prop.alias === 'umbracoHeight')[0].value
					};

					element.on('skyCrop:resize', () => update(obj));
					$rootScope.$on('skyCrop:resize', () => update(obj));

					// Start out
					update(obj);
					
				}
			});

			function update(obj) {
				setSrc(skyCrop.getUrl(obj.image, orgImageSize, { width: masterElement.clientWidth, height: masterElement.clientHeight }, attrs.skyCropMode, attrs.skyCropRound));
			}

			function setSrc(url) {
				if (element[0].tagName === 'IMG') {
					attrs.$set('src', url);
					element.prop('src', url);
				} else {
					element[0].style.backgroundImage = 'url('+url+')';
				}				
			}
			
		}

		return directive;
	}
	

})();