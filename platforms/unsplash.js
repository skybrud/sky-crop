import cropObject from '../utilities/crop';

/**
 * To use focalpoint, round and mode with source.unsplash
 * - these must be set on the custom element.
 */

export default {
	source: 'unsplash',
	regExp: 'source.unsplash',
	split: function split(url) {
		/** Takes original url and extracts containing info */
		const _data = {};

		const urlArr = url.split('/');
		const query = urlArr[urlArr.length - 1];

		_data.imagePath = urlArr.slice(0, urlArr.length - 1).join('/');
		_data.params = {
			width: Number(query.split('x')[0]),
			height: Number(query.split('x')[1]),
			ratio: Number(query.split('x')[0]) / Number(query.split('x')[1]),
		};

		return _data;
	},
	concat: function concat(object) {
		/** Compiles a parameter url for calling the cropped image */
		return `${object.width}x${object.height}`;
	},
	parse: function parse(imageObject) {
		/** Every step for cropping source.unsplash */
		const image = imageObject;
		const urlInfo = this.split(image.inputUrl);

		image.imagePath = urlInfo.imagePath;
		image.setImageParams(urlInfo.params);
		image.calculatedInfo = cropObject.crop(image, image.parent);

		const concatUrl = this.concat(image.calculatedInfo);

		image.outputUrl = `${image.imagePath}/${concatUrl}`;

		return image;
	},
};
