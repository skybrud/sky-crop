/**
 * Provides an factory for recropping image
 *
 * @param {string} selector: the selected crop mode
 * @param {object} container: container object containing all relevant informaiton
 * @param {integer} imageRatio: integer representing image height and width relation
 * @return {object} return crop dimensions.
 */
export default (selector, container, imageRatio, dpr) => {
	const calculated = {};

	const modes = {
		width: () => {
			calculated.width = container.dimensions.width * dpr;
			calculated.height = Math.ceil(calculated.width / imageRatio);
			calculated.ratio = imageRatio;

			return calculated;
		},
		height: () => {
			calculated.height = container.dimensions.height * dpr;
			calculated.width = Math.ceil(calculated.height * imageRatio);
			calculated.ratio = imageRatio;

			return calculated;
		},
		cover: () => {
			const ancestorRatio = container.dimensions.width / container.dimensions.height;
			calculated.ratio = imageRatio;

			if (imageRatio > ancestorRatio) {
				calculated.height = container.dimensions.height * dpr;
				calculated.width = Math.round(calculated.height * imageRatio);
			} else {
				calculated.width = container.dimensions.width * dpr;
				calculated.height = Math.round(calculated.width / imageRatio);
			}

			return calculated;
		},
		contain: () => {
			const ancestorRatio = container.dimensions.width / container.dimensions.height;
			calculated.ratio = imageRatio;

			if (imageRatio > ancestorRatio) {
				calculated.width = container.dimensions.width * dpr;
				calculated.height = Math.round(calculated.width / imageRatio);
			} else {
				calculated.height = container.dimensions.height * dpr;
				calculated.width = Math.round(calculated.height * imageRatio);
			}

			return calculated;
		},
	};

	return modes[selector]();
};
