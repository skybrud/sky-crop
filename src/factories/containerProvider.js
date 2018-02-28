/**
 * Provides a dummy container setting and factory to initiate a setup
 * based on a real domElement
 *
 * @return {object} factory exploiting container information.
 */
export default () => {
	const dimensions = {
		width: 640,
		height: 360,
		ratio: 320 / 180,
	};

	/**
	 * Provides a container factory which container nessesary functionallty
	 * concerning the container to be exploited
	 *
	 * @param {domElement} parentElement: the image's imediate parent (typical div.sky-crop)
	 * @param {domtElement | string} requestedContainer: domElement or selector to be the container
	 * @return {object} exploiting container information.
	 */
	const domBasedSetup = (parentElement, requestedContainer) => {
		const selectedContainer = requestedContainer || 'sky-crop';

		// Recursive function returning a domElement
		// if input: container is a domElement it will be returned immediately
		const getContainer = (currentElement, container) => {
			if (typeof container !== 'string') {
				return container;
			}

			if (currentElement.className.indexOf(container) === -1) {
				return getContainer(currentElement.parentNode, container);
			}

			return currentElement;
		};

		const element = getContainer(parentElement, selectedContainer);

		dimensions.width = element.clientWidth;
		dimensions.height = element.clientHeight;
		dimensions.ratio = element.clientWidth / element.clientHeight;

		const reMeasure = () => {
			dimensions.width = element.clientWidth;
			dimensions.height = element.clientHeight;
			dimensions.ratio = dimensions.width / dimensions.height;
		};

		return {
			element,
			dimensions,
			reMeasure,
		};
	};

	return {
		dimensions,
		domBasedSetup,
	};
};
