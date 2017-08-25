/**
 * Provides configuration object based on requested setup and default behaviour
 *
 * @param {object} requested: requested settings changes.
 * @return {object} object containing setup and enviromental settings.
 */
export default (requested) => {
	const supportedModes = ['width', 'height', 'cover', 'contain'];
	const supportsCSS = !!((window.CSS && window.CSS.supports) || window.supportsCSS || false);
	const supportsObjectFit = supportsCSS
		&& window.CSS.supports('object-fit', 'cover')
		&& window.CSS.supports('object-position', '0% 0%');

	const dpr = window.devicePixelRatio;
	const round = requested.round || 100;
	let mode = requested.mode || 'width';
	let auto = null;

	if (requested.auto === 'width') {
		auto = 'width';
		mode = 'height';
	}

	if (requested.auto === 'height' || !requested.mode) {
		auto = 'height';
		mode = 'width';
	}

	/* Warn if defined mode is invalid and list avalible modes */
	if (requested.mode && (supportedModes.indexOf(requested.mode) === -1)) {
		console.warn(`Sky-crop[configProvider]: '${requested.mode}' does not exist - 'width' set as fallback. Available modes: ${supportedModes.join(' | ')}`);
	}

	if (requested.auto
		&& (requested.auto !== 'height')
		&& (requested.auto !== 'width')) {
		console.warn(`Sky-crop[configProvider]: ${requested.auto} is not a valid value. Use 'width' or 'height'`);
	}

	return {
		useObjectFit: supportsCSS && supportsObjectFit,
		auto,
		mode,
		dpr,
		round,
	};
};
