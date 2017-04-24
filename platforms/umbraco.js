import cropObject from '../utilities/crop';

/**
 * To use round with umbraco - this must be set on the custom element.
 */

export default {
	source: 'umbraco',
	regExp: 'media',
	immutableParams: [],
	split: function split(url) {
		/** Takes original url and extracts containing info */
		const _data = {};

		const params = {};
		const query = url.slice(url.indexOf('?') + 1, url.length).split('&');

		_data.imagePath = url.slice(0, url.indexOf('?'));
		this.immutableParams = [];

		for (let i = 0; i < query.length; i++) {
			const param = query[i].split('=');

			if (query[i].indexOf('height') === -1 && query[i].indexOf('width') === -1) {
				this.immutableParams.push(query[i]);
			}

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
		const order = Object.keys(object).sort();
		const concatData = [];
		for (let i = 0; i < order.length; i++) {
			const param = order[i];
			const val = object[param];

			if (val !== '' && typeof val !== 'object') {
				concatData.push(`${param}=${val}`);
			}
		}

		return concatData;
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

		if (urlInfo.params.mode) {
			urlInfo.params.mode = this.cropMode(urlInfo.params.mode);
			image.mode = urlInfo.params.mode;
		}

		image.imagePath = urlInfo.imagePath;
		image.setImageParams(urlInfo.params);
		image.calculatedInfo = cropObject.crop(image, image.parent);

		const paramUrl = this.immutableParams.concat(this.concat(image.calculatedInfo));
		image.outputUrl = `${image.imagePath}?${paramUrl.join('&')}`;

		return image;
	},
};
