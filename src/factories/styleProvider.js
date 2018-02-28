/**
 * Provides a style factory based on inputs
 *
 * @param {object} image: calculated image dimensions.
 * @param {string} requestedFocal: string with focal percentage
 * @param {object} config: configuration object send from image based on requested setup.
 * @return {function} factory function to set the correct styles.
 */
export default (image, container, requestedFocal, config) => {
	// Settting fallback if requested is empty
	const checkFocal = (inputFocal) => {
		let isValid = !!inputFocal;

		/** Making sure string is correct. Syntax: 'x%,x%' (no zero prefix needed) */
		isValid = (isValid && inputFocal.indexOf(',') !== -1);
		isValid = (isValid && inputFocal.indexOf('%') >= 1);
		isValid = (isValid && inputFocal.indexOf('%') !== inputFocal.lastIndexOf('%'));

		if (!isValid && inputFocal !== undefined) {
			console.warn(`Sky-crop: Invalid focalpoint '${inputFocal}' - focalpoint defaulted to: '50%,50%'`);
		}

		return isValid ? inputFocal : '50%,50%';
	};
	const focalString = checkFocal(requestedFocal);

	// Splitting focal info into ints
	const focal = {
		x: Number(focalString.split(',')[0].replace('%', '')),
		y: Number(focalString.split(',')[1].replace('%', '')),
	};

	// Objectfit & -position styles
	const objectFitStyles = {
		cover: () => ({
			objectFit: config.mode,
			objectPosition: `left ${focal.x}% top ${focal.y}%`,
			height: '100%',
			width: '100%',
		}),
		contain: () => ({
			objectFit: config.mode,
			objectPosition: '50% 50%',
			height: '100%',
			width: '100%',
		}),
	};

	const styles = {
		// If the image has a dimensions smaller than the container.
		center: {
			x: {
				width: 'auto',
				height: '100%',
				top: `${focal.y}%`,
				left: '50%',
				transform: `translate(-50%, -${focal.y}%)`,
			},
			y: {
				width: '100%',
				height: 'auto',
				top: '50%',
				left: `${focal.x}%`,
				transform: `translate(-${focal.x}%, -50%)`,
			},
		},
		coverFit: {
			// if the container has a dimensions smaller than the image
			x: {
				width: '100%',
				height: 'auto',
				top: `${focal.y}%`,
				left: `${focal.x}%`,
				transform: `translate(-${focal.x}%, -${focal.y}%)`,
			},
			y: {
				width: 'auto',
				height: '100%',
				top: `${focal.y}%`,
				left: `${focal.x}%`,
				transform: `translate(-${focal.x}%, -${focal.y}%)`,
			},
		},
		containFit: {
			x: {
				width: '100%',
				height: 'auto',
				top: '50%',
				left: '0',
				transform: 'translate(0%, -50%)',
			},
			y: {
				width: 'auto',
				height: '100%',
				top: '0',
				left: '50%',
				transform: 'translate(-50%, 0%)',
			},
		},
	};

	const fitStyles = {
		width: () => {
			const imageFullyVisible = container.dimensions.ratio >= image.ratio;
			return imageFullyVisible ? styles.coverFit.x : styles.center.y;
		},
		height: () => {
			const imageFullyVisible = container.dimensions.ratio <= image.ratio;
			return imageFullyVisible ? styles.coverFit.y : styles.center.x;
		},
		contain: () => {
			const containToWidth = container.dimensions.ratio <= image.ratio;
			return containToWidth ? styles.containFit.x : styles.containFit.y;
		},
		cover: () => {
			const coverByWidth = container.dimensions.ratio <= image.ratio;
			return coverByWidth ? styles.coverFit.y : styles.coverFit.x;
		},
	};

	const autoStyles = {
		width: () => ({ height: '100%' }),
		height: () => ({ width: '100%' }),
	};

	/**
	 * Provides a style object
	 *
	 * @return {object} styling object based on initial configuration
	 */
	return () => {
		if (config.auto) {
			return autoStyles[config.auto]();
		}

		if (config.useObjectFit
			&& (config.mode === 'cover' || config.mode === 'contain')) {
			return objectFitStyles[config.mode]();
		}

		return fitStyles[config.mode]();
	};
};
