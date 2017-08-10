import cropper from './cropper';

/**
 * Operates on instance of 'cropper' and returns a string url
 *
 * @param {string} cropUrl: the provided url which contains original image info
 * @param {object} ancestorDimensions: object containing width and height measures
 * @param {string} mode: requested fitting mode
 * @param {number} round: recrop interval
 * @return {string} compiled src url used as image source
 */
export default (cropUrl, ancestorDimensions, mode, round) => {
	const imagePath = cropUrl.slice(0, cropUrl.indexOf('?'));
	const parameters = cropUrl.slice(cropUrl.indexOf('?') + 1, cropUrl.length).split('&');

	const mutatedParameters = [];
	let calculated = null;
	let translatedMode = null;
	let immutableParameters = [];
	let imageDimensions = null;
	let anchorString = null;

	// Find sky-crop mode name
	const modeTranslater = (term) => {
		const terms = {
			pad: 'contain',
			boxpad: 'contain',
			contain: 'contain',
			min: 'cover',
			max: 'cover',
			cover: 'cover',
			width: 'width',
			height: 'height',
		};

		return terms[term];
	};
	translatedMode = modeTranslater(mode);

	// Set parameters for return url
	const heightOrWidth = string => string.indexOf('height') !== -1 || string.indexOf('width') !== -1;

	immutableParameters = parameters.filter(param => !heightOrWidth(param));

	imageDimensions = parameters.reduce((acc, cur) => {
		if (heightOrWidth(cur)) {
			acc[cur.split('=')[0]] = Number(cur.split('=')[1]);
		}

		return acc;
	}, {});

	anchorString = immutableParameters.reduce((acc, cur) => {
		if (cur.indexOf('center') !== -1) {
			acc = `${Number(cur.split('=')[1].split(',')[0]) * 100}%,`;
			acc += `${Number(cur.split('=')[1].split(',')[1]) * 100}%`;
		}

		return acc;
	}, '');

	calculated = cropper(imageDimensions, ancestorDimensions, translatedMode, round);

	Object.keys(calculated).forEach((key) => {
		mutatedParameters.push(`${key}=${calculated[key]}`);
	});

	return {
		url: `${imagePath}?${immutableParameters.join('&')}&${mutatedParameters.join('&')}`,
		dimensions: calculated,
		anchor: anchorString,
	};
};
