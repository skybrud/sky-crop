export default (requestedAnchor, mode) => {
	const styling = {};
	const anchorString = requestedAnchor || '50%,50%';

	const anchorPoints = {
		x: Number(anchorString.split(',')[0].replace('%', '')) / 100,
		y: Number(anchorString.split(',')[1].replace('%', '')) / 100,
	};

	return (cropDimensions, containerDimensions) => {
		const dimensionDiff = {
			width: containerDimensions.width - cropDimensions.width,
			height: containerDimensions.height - cropDimensions.height,
		};

		const anchor = (orientation) => {
			const convertToString = (dimension, input) => `${(input / cropDimensions[dimension]) * 100}%`;

			const position = {
				x: () => {
					const containerX = containerDimensions.width * 0.5;
					const anchorX = cropDimensions.width * anchorPoints.x;
					const moveX = containerX - anchorX;

					return convertToString('width', Math.min(0, Math.max(dimensionDiff.width, moveX)));
				},
				y: () => {
					const containerY = containerDimensions.height * 0.5;
					const anchorY = cropDimensions.height * anchorPoints.y;
					const moveY = containerY - anchorY;

					return convertToString('height', Math.min(0, Math.max(dimensionDiff.height, moveY)));
				},
			};

			return position[orientation]();
		};

		const anchorValues = {
			x: anchor('x'),
			y: anchor('y'),
		};

		const shouldCenter = orientation => dimensionDiff[orientation] > 0;

		const imageRatio = cropDimensions.width / cropDimensions.height;
		const containerRatio = containerDimensions.width / containerDimensions.height;

		const positionTop = `${((dimensionDiff.height / containerDimensions.height) / 2) * 100}%`;
		const positionLeft = `${((dimensionDiff.width / containerDimensions.width) / 2) * 100}%`;
		const percentageHeight = `${(cropDimensions.height / containerDimensions.height) * 100}%`;
		const percentageWidth = `${(cropDimensions.width / containerDimensions.width) * 100}%`;
		const dynamicTranslate = `translate(${anchorValues.x}, ${anchorValues.y})`;

		const modeStyles = {
			width: () => {
				styling.width = percentageWidth;
				styling.transform = dynamicTranslate;

				if (shouldCenter('height')) {
					styling.top = positionTop;
				}
			},
			height: () => {
				styling.height = percentageHeight;
				styling.transform = dynamicTranslate;

				if (shouldCenter('width')) {
					styling.left = positionLeft;
				}
			},
			cover: () => {
				styling.minHeight = '100%';
				styling.minWidth = '100%';
				styling.transform = dynamicTranslate;
			},
			contain: () => {
				styling.width = imageRatio < containerRatio ? 'auto' : '100%';
				styling.height = imageRatio < containerRatio ? '100%' : 'auto';
				styling.top = '50%';
				styling.left = '50%';
				styling.transform = 'translate(-50%, -50%)';
			},
		};

		modeStyles[mode]();

		return styling;
	};
};
