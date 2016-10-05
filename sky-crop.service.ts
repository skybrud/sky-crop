declare module sky {

	interface ISkyCropWidthHeightObj {
		width?: number;
		height?: number;
	}

	interface ISkyCropService {
		getUrl(image: string, imageSize: ISkyCropWidthHeightObj, masterSize: ISkyCropWidthHeightObj, mode?: string, round?: number): string;
		infoFromSrc(src: string): ISkyCropWidthHeightObj;
		anchorFromSrc(src: string): any;
	}
}

(function() {
	'use strict';

	angular.module('skyCrop').service('skyCrop', skyCropService);

	skyCropService.$inject = ['skyPath'];
	function skyCropService(skyPath): sky.ISkyCropService {
		var _this = this;

		var path = skyPath.get();


		_this.getUrl = function(image, imageSize, masterSize, mode = 'width', round = 1) {

			var orgImageProportions = imageSize.height / imageSize.width;
			masterSize.proportion = masterSize.width / masterSize.height;

			var calculatedSize: sky.ISkyCropWidthHeightObj = {};

			if (mode === 'width') {
				calculatedSize.width = roundTo(masterSize.width, round);
				calculatedSize.height = Math.round(calculatedSize.width * orgImageProportions);
			} else if (mode === 'height') {
				calculatedSize.height = roundTo(masterSize.height, round);
				calculatedSize.width = calculatedSize.height / orgImageProportions;
			} else if (mode === 'cover') {
				calculatedSize.height = roundTo(masterSize.height, round);
				calculatedSize.width = roundTo(masterSize.width, round);
			} else if (mode === 'contain') {
				if (masterSize.proportion < orgImageProportions) {
					calculatedSize.width = masterSize.width;
					calculatedSize.height = Math.round(masterSize.width / orgImageProportions);
				} else {
					calculatedSize.width = Math.round(masterSize.height * orgImageProportions);
					calculatedSize.height = masterSize.height;
				}
				if (round > 1) {
					console.warn('rounding not supported when skyCropMode === contain')
				}
			}
			return path + image + '?' + srcFromObj(angular.extend({}, imageSize, calculatedSize));
		};

		_this.infoFromSrc = function(src) {
			var params = {};
			var query = src.slice(src.indexOf('?') + 1, src.length).split('&');

			for (var i = 0; i < query.length; i++) {
				var param = query[i].split('=');

				if (param[1] !== '') {
					params[param[0]] = param[1];
				}
			}
			return params;
		};

		_this.anchorFromSrc = function(src) {
			var info = _this.infoFromSrc(src);

			var anchor = {
				x: '50%',
				y: '50%'
			};

			if (info.hasOwnProperty('center')) {
				var centerNumbers = info.center.match(/\d*\.\d*/g);

				if (centerNumbers && centerNumbers.length == 2) {
					anchor.y = (parseFloat(centerNumbers[0]) * 100) + '%';
					anchor.x = (parseFloat(centerNumbers[1]) * 100) + '%';
				}
			}

			return anchor;
		}

		function roundTo(value, round) {
			return Math.ceil(value / round) * round;
		}

		function srcFromObj(params) {
			var query = '';
			var order = Object.keys(params).sort();

			for (var i = 0; i < order.length; i++) {
				var param = order[i],
					val = params[param];
				if (val !== '') {
					query += param + '=' + val + '&';
				}
			}
			return query.slice(0, -1);
		}

		return this;
	}

})();