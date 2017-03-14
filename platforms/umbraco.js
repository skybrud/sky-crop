import cropObject from '../utilities/crop';

/**
 * To use round with umbraco - this must be set on the custom element.
 */

export default {
	source: 'umbraco',
	regExp: 'media',
	split: function split(url) {
		/** Takes original url and extracts containing info */
		const _data = {};

		const params = {};
		const query = url.slice(url.indexOf('?') + 1, url.length).split('&');

		_data.imagePath = url.slice(0, url.indexOf('?'));

		for (let i = 0; i < query.length; i++) {
			const param = query[i].split('=');

			if (param[1] !== '') {
				params[param[0]] = param[1];
			}
		}

		params.ratio = params.width / params.height;

		_data.params = params;

		return _data;
	},
	concat: function concat(object) {
		/** Compiles a parameter url for calling the cropped image */
		const _data = {};

		let query = '';
		const order = Object.keys(object).sort();

		for (let i = 0; i < order.length; i++) {
			const param = order[i];
			const val = object[param];
			if (val !== '') {
				query += `${param}=${val}&`;
			}
		}

		_data.outputUrl = query.slice(0, -1);

		return _data;
	},
	anchorPoint: function anchorPoint(anchorString) {
		/** Creates an object for focal-/anchorpoint */
		const _anchorObject = {};

		_anchorObject.x = `${(anchorString.split(',')[0] * 100)}%`;
		_anchorObject.y = `${(anchorString.split(',')[1] * 100)}%`;

		return _anchorObject;
	},
	cropMode: function cropMode(cropName) {
		/** translates Umbraco crop words to our version */
		let translatedName = '';

		if (cropName === 'pad' || cropName === 'boxpad' || cropName === 'contain') {
			translatedName = 'contain';
		} else if (cropName === 'min' || cropName === 'max' || cropName === 'cover') {
			translatedName = 'cover';
		} else {
			translatedName = 'width';
		}

		return translatedName;
	},
	parse: function parse(imageObject) {
		/** Every step for cropping umbraco */
		const image = imageObject;

		const urlInfo = this.split(image.inputUrl);

		if (urlInfo.params.center) {
			image.anchor = this.anchorPoint(urlInfo.params.center);
		}
		if (urlInfo.params.mode) {
			urlInfo.params.mode = this.cropMode(urlInfo.params.mode);
			image.mode = urlInfo.params.mode;
		}

		image.imagePath = urlInfo.imagePath;
		image.setImageParams(urlInfo.params);
		image.calculatedInfo = cropObject.crop(image, image.parent);

		const concatData = this.concat(image.calculatedInfo);
		image.outputUrl = `${image.imagePath}?${concatData.outputUrl}`;

		return image;
	},
};
