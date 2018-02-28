import cropModeProvider from './cropModeProvider';

/**
 * Takes crop input and passes it to the cropModeProvider and returns the result generated
 * by the cropModeProvider.
 *
 * @param {object} image: calculated image dimensions.
 * @param {object} container: container information
 * @param {object} mode: requested mode
 * @return {object} returning crop dimensions .
 */
export default (imageDimensions, container, mode, dpr) => {
	const ratio = imageDimensions.width / imageDimensions.height;
	const selectedMode = cropModeProvider(mode, container, ratio, dpr);

	return selectedMode;
};
