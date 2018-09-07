import cropper from './cropper';

/**
 * Operates on instance of 'cropper' and returns a string url
 *
 * @param {string} cropUrl: the provided url which contains original image info
 * @param {object} containerDimensions: object containing width and height measures
 * @param {string} mode: requested fitting mode
 * @return {string} compiled src url used as image source
 */
export default (cropUrl, mode, dpr) => {
	const parameters = cropUrl.split('/');
	const inputWidth = parameters[parameters.length - 1].split('x')[0];
	const inputHeight = parameters[parameters.length - 1].split('x')[1];
	const isNumeric = Boolean(Number(inputWidth)) && Boolean(Number(inputHeight));
	let calculated = null;

	let imageDimensions = {
		width: Number(inputWidth),
		height: Number(inputHeight),
	};

	const crop = (container) => {
		// Fallback if input is missing dimensions
		if (!isNumeric) {
			imageDimensions = Object.assign({}, container.dimensions);
			console.warn(`Module sky-crop: Container dimension used! Provided url did not contain width and/or height parameters '${cropUrl}'`);
		}

		calculated = cropper(imageDimensions, container, mode, dpr);

		parameters[parameters.length - 1] = `${calculated.width}x${calculated.height}`;

		return {
			url: parameters.join('/'),
			dimensions: calculated,
		};
	};

	return {
		crop,
	};
};
