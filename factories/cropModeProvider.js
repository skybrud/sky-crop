import roundProvider from './roundProvider';

export default (selector, roundValue) => {
	const calculated = {};
	const round = roundProvider(roundValue);

	const modes = {
		width: (imageRatio, ancestorDimensions) => {
			calculated.width = round(ancestorDimensions.width);
			calculated.height = Math.ceil(calculated.width / imageRatio);

			return calculated;
		},
		height: (imageRatio, ancestorDimensions) => {
			calculated.height = round(ancestorDimensions.height);
			calculated.width = Math.ceil(calculated.height * imageRatio);

			return calculated;
		},
		cover: (imageRatio, ancestorDimensions) => {
			calculated.width = round(ancestorDimensions.width);
			calculated.height = round(ancestorDimensions.height);

			return calculated;
		},
		contain: (imageRatio, ancestorDimensions) => {
			const ancestorRatio = ancestorDimensions.width / ancestorDimensions.height;

			if (imageRatio > ancestorRatio) {
				calculated.width = ancestorDimensions.width;
				calculated.height = Math.round(ancestorDimensions.width / imageRatio);
			} else {
				calculated.width = Math.round(ancestorDimensions.height * imageRatio);
				calculated.height = ancestorDimensions.height;
			}

			return calculated;
		},
	};

	/* Warn if undefined mode is selected and list avalible modes */
	if (!modes[selector]) {
		const availableModes = Object.keys(modes).join(' | ');
		console.warn(`Mode '${selector}' does not exist - 'width' set as fallback. Available modes: ${availableModes}`);
	}

	return modes[selector] || modes.width;
};
