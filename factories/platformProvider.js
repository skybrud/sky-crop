import 'core-js/fn/array/find';
import unsplash from './unsplash';
import umbraco from './umbraco';

export default (cropSrc, ancestorDimensions, mode, round) => {
	// "Key: value"" is equeal to "regEx: required job"
	const sourceCollection = {
		'source.unsplash': unsplash,
		media: umbraco,
	};

	// Finds first key which has a match in cropSrc and assigns it to 'const key'
	const key = Object.keys(sourceCollection).find(regEx => cropSrc.indexOf(regEx) !== -1);

	return sourceCollection[key](cropSrc, ancestorDimensions, mode, round);
};
