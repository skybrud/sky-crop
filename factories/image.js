import platformProvider from './platformProvider';
import resizer from './resizer';
import styleProvider from './styleProvider';

export default (element, cropSrc, ancestorClass, mode, round, focal) => {
	let ancestor = null;
	let ancestorDimensions = null;
	let cropInformation = null;
	let styling = null;
	let anchorString = null;

	const getAncestor = (domElement, selector) => {
		if (typeof selector === 'string' && domElement.className.indexOf(selector) === -1) {
			return getAncestor(domElement.parentNode, selector);
		}
		return domElement;
	};

	const updateAncestorDimension = container => ({
		width: container.clientWidth,
		height: container.clientHeight,
	});

	ancestor = getAncestor(element, ancestorClass);
	ancestorDimensions = updateAncestorDimension(ancestor);
	cropInformation = platformProvider(cropSrc, ancestorDimensions, mode, round);

	anchorString = focal || cropInformation.anchor;
	styling = styleProvider(anchorString, mode);

	return {
		get src() {
			return cropInformation.url;
		},
		get ancestor() {
			return ancestor;
		},
		get dimensions() {
			return cropInformation.dimensions;
		},
		get recropCondition() {
			return resizer(mode, round, ancestor, cropInformation.dimensions);
		},
		get crop() {
			ancestorDimensions = updateAncestorDimension(ancestor);
			cropInformation = platformProvider(cropSrc, ancestorDimensions, mode, round);

			return cropInformation.url;
		},
		get styling() {
			return styling(cropInformation.dimensions, ancestorDimensions);
		},
		recalcStyles() {
			ancestorDimensions = updateAncestorDimension(ancestor);
			styling(cropInformation.dimensions, ancestorDimensions);
		},
	};
};
