export default (fitMode, rounding, container, image) => {
	const conditions = {
		width: () => {
			if (container.clientWidth > image.width ||
				container.clientWidth < (image.width - rounding)) {
				return true;
			}

			return false;
		},
		height: () => {
			if (container.clientHeight > image.height ||
				container.clientHeight < (image.height - rounding)) {
				return true;
			}

			return false;
		},
		contain: () => {
			if (container.clientWidth > image.width
				&& container.clientHeight !== image.height) {
				return true;
			}

			if (container.clientHeight > image.height
				&& container.clientWidth !== image.width) {
				return true;
			}

			return false;
		},
		cover: () => {
			if (conditions.width() || conditions.height()) {
				return true;
			}

			return false;
		},
	};

	return conditions[fitMode]();
};
