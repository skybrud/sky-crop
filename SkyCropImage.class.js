import platformObject from './utilities/platform';

export default class SkyCropImage {
	constructor(inputSrc) {
		/**
		 *	this._isDefault is for keeping tabs on values
		 *	that should only be changed once from default.
		 */
		this._isDefault = {
			anchor: true,
			mode: true,
			round: true,
		};

		/** Init object with default values */
		this._inputUrl = inputSrc;
		this._anchor = { x: '50%', y: '50%' };
		this._round = 200;
		this._mode = 'width';
	}

	/**
	 * Class methods
	 */
	setParentInfo(domElement) {
		// domElement should be type: HTMLElement
		this._parent = {};
		this._parent.element = domElement;
		this._parent.width = domElement.clientWidth;
		this._parent.height = domElement.clientHeight;
		this._parent.ratio = domElement.clientWidth / domElement.clientHeight;
	}

	setImageParams(params) {
		// params should be type: Object
		this.width = params.width;
		this.height = params.height;
		this.ratio = params.ratio;
		this.mode = params.mode;
		this.round = params.round;
	}

	styling(object, isImgElement) {
		const styleObject = [];

		/* START: Calculate transform points */
		const transformAnchor = {};

		/* Convert anchor % to decimal */
		const pointX = Number(this.anchor.x.replace('%', '')) / 100;
		const pointY = Number(this.anchor.y.replace('%', '')) / 100;

		/* Finding difference in size between parent and original image */
		const differenceX = this.parent.width - this.calculatedInfo.width;
		const differenceY = this.parent.height - this.calculatedInfo.height;

		/* Setting focal point relative to difference in size */
		transformAnchor.x = `${differenceX * pointX}px`;
		transformAnchor.y = `${differenceY * pointY}px`;
		/* END: Calculate transform points */

		if (!isImgElement) {
			styleObject.push({
				name: 'background-image',
				value: `url(${object.outputUrl})`,
			});

			styleObject.push({
				name: 'background-position',
				value: `${object.anchor.x} ${object.anchor.y}`,
			});
		} else {
			styleObject.push({
				name: 'transform',
				value: `translate(${transformAnchor.x}, ${transformAnchor.y})`,
			});
		}

		if (object.mode && object.mode === 'contain'
		&& object.parent.ratio < object.ratio) {
			styleObject.push({
				name: 'max-width',
				value: '100%',
			});
			styleObject.push({
				name: 'max-height',
				value: '100%',
			});
		}

		this._calculatedInfo.styles = styleObject;
	}

	runCropJob(isImgElement = true) {
		platformObject.sourceJob(this);

		this.updateStyling(isImgElement);
	}

	updateStyling(isImgElement = true) {
		this.styling(this, isImgElement);
	}

	/**
	 * Getters and setters
	 */
	set mediaSource(string) {
		this._mediaSource = string;
	}
	get mediaSource() {
		return this._mediaSource;
	}

	set inputUrl(string) {
		this._inputUrl = string;
	}
	get inputUrl() {
		return this._inputUrl;
	}

	set outputUrl(string) {
		this._outputUrl = string;
	}
	get outputUrl() {
		return this._outputUrl;
	}

	set imagePath(string) {
		this._imagePath = string;
	}
	get imagePath() {
		return this._imagePath;
	}

	set width(integer) {
		this._width = Number(integer);
	}
	get width() {
		return this._width;
	}

	set height(integer) {
		this._height = Number(integer);
	}
	get height() {
		return this._height;
	}

	set anchor(object) {
		/* Can only change if anchor set method has not been run before */
		this._anchor.x = this._isDefault.anchor ? object.x : this._anchor.x;
		this._anchor.y = this._isDefault.anchor ? object.y : this._anchor.y;

		this._isDefault.anchor = false;
	}
	get anchor() {
		return this._anchor;
	}

	get parent() {
		return this._parent;
	}

	set round(integer) {
		/**
		 * Can only change if anchor set method has not been run before
		 * AND(!) will only react if the argument can be convertet to a number
		 */
		if (!isNaN(Number(integer))) {
			this._round = this._isDefault.mode ? Number(integer) : this._round;

			this._isDefault.round = false;
		}
	}
	get round() {
		return this._round;
	}

	set ratio(float) {
		this._ratio = Number(float);
	}
	get ratio() {
		return this._ratio;
	}

	set mode(string) {
		/**
		 * Can only change if anchor set method has not been run before
		 * AND(!) will only react if the argument is not a falsy/false
		 */
		if (string) {
			this._mode = this._isDefault.mode ? String(string) : this._mode;

			this._isDefault.mode = false;
		}
	}
	get mode() {
		return this._mode;
	}

	set calculatedInfo(object) {
		this._calculatedInfo = this._calculatedInfo || {};
		this._calculatedInfo.width = object.width;
		this._calculatedInfo.height = object.height;
	}
	get calculatedInfo() {
		return this._calculatedInfo;
	}
}
