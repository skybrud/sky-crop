/**
 * Provides booleans indication if and action should be startet or not
 *
 * @param {object} container: calculated container information.
 * @param {object} image: calculated image dimensions.
 * @param {object} config: configuration object send from image based on requested setup.
 * @return {object} properties which will resolve to true if the image should be recropped
 */
export default (container, image, config) => {
	const upperLimit = dimension => Math.ceil((image[dimension] / config.dpr) + config.round);

	let imageFullyVisible = true;

	const restyle = () => {
		if ((container.dimensions.ratio > image.ratio) && !imageFullyVisible) {
			imageFullyVisible = true;
			return true;
		}

		if ((container.dimensions.ratio < image.ratio) && imageFullyVisible) {
			imageFullyVisible = false;
			return true;
		}

		if (container.dimensions.ratio === image.ratio) {
			imageFullyVisible = true;
			return true;
		}

		return false;
	};

	const recrop = {
		width: () => container.dimensions.width > upperLimit('width'),
		height: () => container.dimensions.height > upperLimit('height'),
		contain: () => recrop.width() && recrop.height(),
		cover: () => recrop.width() || recrop.height(),
	};

	return {
		recrop: recrop[config.mode],
		restyle,
	};
};
