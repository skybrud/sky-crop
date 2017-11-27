import 'core-js/fn/array/find';
import unsplash from './unsplash';
import umbraco from './umbraco';

/**
 * Initiated cropping based on image source.
 *
 * @param {string} src: image original source
 * @param {string} mode: requested fitting mode
 * @param {integer} dpr: system devicePixelRatio setting
 * @return {function} cropping functionallity from the needed platform
 */
export default (src, mode, dpr) => {
	// "Key: value"" is equeal to "regEx: required job"
	const sourceCollection = {
		'source.unsplash': unsplash,
		media: umbraco,
	};

	// Finds first key which has a match in src and assigns it to 'const key'
	const key = Object.keys(sourceCollection).find(regEx => src.indexOf(regEx) !== -1);

	return sourceCollection[key](src, mode, dpr);
};
