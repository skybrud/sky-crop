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
	const parameters = cropUrl.split('/');
	const inputWidth = parameters[parameters.length - 1].split('x')[0];
	const inputHeight = parameters[parameters.length - 1].split('x')[1];
	const isNumeric = Boolean(Number(inputWidth)) && Boolean(Number(inputHeight));

	let imageDimensions = {
		width: Number(inputWidth),
		height: Number(inputHeight),
	};

	// Fallback if input is missing dimensions
	if (!isNumeric) {
		imageDimensions = Object.assign({}, ancestorDimensions);
		console.warn(`Module sky-crop: Ancestor dimension used! Provided url did not contain width and/or height parameters '${cropUrl}'`);
	}

	const calculated = cropper(imageDimensions, ancestorDimensions, mode, round);

	parameters[parameters.length - 1] = `${calculated.width}x${calculated.height}`;

	return {
		url: parameters.join('/'),
		dimensions: calculated,
	};
};
