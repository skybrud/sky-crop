
import unsplashPlatform from '../platforms/unsplash';
import umbracoPlatform from '../platforms/umbraco';

const platform = (function platform() {
	/** Array of imported platforms */
	const _sourceCollection = [
		unsplashPlatform,
		umbracoPlatform,
	];

	/**
	 * Checks if source is supported by comparing sourceUrl to _sourceCollection.regExp
	 * If supported: it initiates the platforms predefined job.
	 */
	function _sourceJob(imageObject) {
		let image = imageObject;
		const sourceUrl = image.inputUrl;

		for (let i = 0; i < _sourceCollection.length; i++) {
			if (sourceUrl.indexOf(_sourceCollection[i].regExp) !== -1) {
				image.mediaSource = _sourceCollection[i].source;
				image = _sourceCollection[i].parse(image);
				break;
			}
		}

		return image;
	}

	return {
		sourceJob: _sourceJob,
	};
}());

export default platform;
