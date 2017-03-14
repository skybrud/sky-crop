const crop = (function crop() {
	function _roundTo(value, round) {
		return Math.ceil(value / round) * round;
	}

	/**
	 * Cropping corresponding to the image mode is done here.
	 * @param {width, height, ratio, round, mode} image
	 * @param {width, height, ratio} parent
	 */
	function _crop(image, parent) {
		const _round = image.round;
		const _mode = image.mode;
		const _calculatedSize = {
			width: 0,
			height: 0,
		};

		if (_mode === 'height') {
			_calculatedSize.height = _roundTo(parent.height, _round);
			_calculatedSize.width = _calculatedSize.height * image.ratio;
		} else if (_mode === 'cover') {
			_calculatedSize.height = _roundTo(parent.height, _round);
			_calculatedSize.width = _roundTo(parent.width, _round);
		} else if (_mode === 'contain') {
			if (parent.ratio < image.ratio) {
				_calculatedSize.width = parent.width;
				_calculatedSize.height = Math.round(parent.width * image.ratio);
			} else {
				_calculatedSize.width = Math.round(parent.height / image.ratio);
				_calculatedSize.height = parent.height;
			}
			if (_round !== 1) {
				console.warn('Crop.js: Rounding not supported when skyCropMode === contain');
			}
		} else {
			if (_mode !== 'width') {
				console.info(`Crop.js: Crop mode '${_mode}' not supported, 'width' set as fallback`);
			}
			_calculatedSize.width = _roundTo(parent.width, _round);
			_calculatedSize.height = Math.round(_calculatedSize.width / image.ratio);
		}

		return _calculatedSize;
	}

	return {
		crop: _crop,
	};
}());

export default crop;
