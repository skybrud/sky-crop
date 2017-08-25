import cropper from './cropper';

/**
 * Operates on instance of 'cropper' and returns a string url
 *
 * @param {string} url: the provided url which contains original image info
 * @param {string} mode: requested fitting mode
 * @param {integer} dpr: system devicePixelRatio setting
 * @return {object} object containing crop factory and extracted focalPoint
 */
export default (url, mode, dpr) => {
	const imagePath = url.slice(0, url.indexOf('?'));
	const parameters = url.slice(url.indexOf('?') + 1, url.length).split('&');

	let calculated = null;
	let translatedMode = null;
	let immutableParameters = [];
	let imageDimensions = null;
	let focalPoint = null;

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

	// Finds all parameters which will returned untouched
	immutableParameters = parameters.filter(param => !heightOrWidth(param));

	imageDimensions = parameters.reduce((acc, cur) => {
		if (heightOrWidth(cur)) {
			acc[cur.split('=')[0]] = Number(cur.split('=')[1]);
		}

		return acc;
	}, {});

	// Transforms decimal to passable syntax '50%,50%'.
	focalPoint = immutableParameters.reduce((acc, cur) => {
		if (cur.indexOf('center') !== -1) {
			acc = `${Number(cur.split('=')[1].split(',')[0]) * 100}%,`;
			acc += `${Number(cur.split('=')[1].split(',')[1]) * 100}%`;
		}

		return acc;
	}, '');

	/**
	 * Factory creating cropping url and extracting new image dimensions.
	 *
	 * @param {object} container: container information
	 * @return {object} object containing crop url and extracted dimensions object
	 */
	const crop = (container) => {
		const mutatedParameters = [];
		calculated = cropper(imageDimensions, container, translatedMode, dpr);

		Object.keys(calculated).forEach((key) => {
			if (key !== 'ratio') {
				mutatedParameters.push(`${key}=${calculated[key]}`);
			}
		});

		return {
			url: `${imagePath}?${immutableParameters.join('&')}&${mutatedParameters.join('&')}`,
			dimensions: calculated,
		};
	};

	return {
		crop,
		focalPoint,
	};
};
