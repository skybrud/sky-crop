import cropModeProvider from './cropModeProvider';

export default (imageDimensions, ancestorDimensions, modeString, round) => {
	const ratio = imageDimensions.width / imageDimensions.height;
	const selectedMode = cropModeProvider(modeString, round);

	return selectedMode(ratio, ancestorDimensions);
};
