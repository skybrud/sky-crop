(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lodash.throttle')) :
	typeof define === 'function' && define.amd ? define(['exports', 'lodash.throttle'], factory) :
	(factory((global.SkyCrop = {}),global._throttle));
}(this, (function (exports,_throttle) { 'use strict';

	_throttle = _throttle && _throttle.hasOwnProperty('default') ? _throttle['default'] : _throttle;

	var _callbacks = [];
	var _throttledCallbacks = [];
	var _listenerOn = false;

	var runCallbacks = function () {
		for (var i = _callbacks.length - 1; i >= 0; i--) {
			_callbacks[i]();
		}
	};

	var runThrottledCallbacks = _throttle(function () {
		for (var i = _throttledCallbacks.length - 1; i >= 0; i--) {
			_throttledCallbacks[i]();
		}
	}, 300);

	function onResize() {
		runCallbacks();
		runThrottledCallbacks();
	}

	function on(fn, throttle) {
		if ( throttle === void 0 ) throttle = true;

		var array = (throttle) ? _throttledCallbacks : _callbacks;
		array.push(fn);
		if (typeof window !== 'undefined' && !_listenerOn) {
			window.addEventListener('resize', onResize);
			_listenerOn = true;
		}
	}

	function off(fn, throttle) {
		if ( throttle === void 0 ) throttle = true;

		var array = (throttle) ? _throttledCallbacks : _callbacks;
		var index = array.indexOf(fn);
		if (index > -1) {
			array.splice(index, 1);
		}
		if (typeof window !== 'undefined'
			&& _listenerOn
			&& !_callbacks.length
			&& !_throttledCallbacks.length) {
			window.removeEventListener('resize', onResize);
			_listenerOn = false;
		}
	}

	var resize = {
		on: on,
		off: off,
	};

	/**
	 * Provides an factory for recropping image
	 *
	 * @param {string} selector: the selected crop mode
	 * @param {object} container: container object containing all relevant informaiton
	 * @param {integer} imageRatio: integer representing image height and width relation
	 * @return {object} return crop dimensions.
	 */
	function cropModeProvider (selector, container, imageRatio, dpr) {
		var calculated = {};

		var roundValues = function (object) { return ({
			width: Math.round(object.width),
			height: Math.round(object.height),
			ratio: object.ratio,
		}); };

		// TODO: ROUNDING MUST BE IMPLEMENTED DYNAMICLY
		var cacheRound = function (value) { return Math.ceil((value * dpr) / 100) * 100; };

		var modes = {
			width: function () {
				calculated.width = cacheRound(container.dimensions.width);
				calculated.height = Math.ceil(calculated.width / imageRatio);
				calculated.ratio = imageRatio;

				return roundValues(calculated);
			},
			height: function () {
				calculated.height = cacheRound(container.dimensions.height);
				calculated.width = Math.ceil(calculated.height * imageRatio);
				calculated.ratio = imageRatio;

				return roundValues(calculated);
			},
			cover: function () {
				var ancestorRatio = container.dimensions.width / container.dimensions.height;
				calculated.ratio = imageRatio;

				if (imageRatio > ancestorRatio) {
					calculated.height = cacheRound(container.dimensions.height);
					calculated.width = Math.round(calculated.height * imageRatio);
				} else {
					calculated.width = cacheRound(container.dimensions.width);
					calculated.height = Math.round(calculated.width / imageRatio);
				}

				return roundValues(calculated);
			},
			contain: function () {
				var ancestorRatio = container.dimensions.width / container.dimensions.height;
				calculated.ratio = imageRatio;

				if (imageRatio > ancestorRatio) {
					calculated.width = cacheRound(container.dimensions.width);
					calculated.height = Math.round(calculated.width / imageRatio);
				} else {
					calculated.height = cacheRound(container.dimensions.height);
					calculated.width = Math.round(calculated.height * imageRatio);
				}

				return roundValues(calculated);
			},
		};

		return modes[selector]();
	}

	/**
	 * Takes crop input and passes it to the cropModeProvider and returns the result generated
	 * by the cropModeProvider.
	 *
	 * @param {object} image: calculated image dimensions.
	 * @param {object} container: container information
	 * @param {object} mode: requested mode
	 * @return {object} returning crop dimensions .
	 */
	function cropper (imageDimensions, container, mode, dpr) {
		var ratio = imageDimensions.width / imageDimensions.height;
		var selectedMode = cropModeProvider(mode, container, ratio, dpr);

		return selectedMode;
	}

	/**
	 * Operates on instance of 'cropper' and returns a string url
	 *
	 * @param {string} cropUrl: the provided url which contains original image info
	 * @param {object} containerDimensions: object containing width and height measures
	 * @param {string} mode: requested fitting mode
	 * @return {string} compiled src url used as image source
	 */
	function unsplash (cropUrl, mode, dpr) {
		var parameters = cropUrl.split('/');
		var inputWidth = parameters[parameters.length - 1].split('x')[0];
		var inputHeight = parameters[parameters.length - 1].split('x')[1];
		var isNumeric = Boolean(Number(inputWidth)) && Boolean(Number(inputHeight));
		var calculated = null;

		var imageDimensions = {
			width: Number(inputWidth),
			height: Number(inputHeight),
		};

		var crop = function (container) {
			// Fallback if input is missing dimensions
			if (!isNumeric) {
				imageDimensions = Object.assign({}, container.dimensions);
				console.warn(("Module sky-crop: Container dimension used! Provided url did not contain width and/or height parameters '" + cropUrl + "'"));
			}

			calculated = cropper(imageDimensions, container, mode, dpr);

			parameters[parameters.length - 1] = (calculated.width) + "x" + (calculated.height);

			return {
				url: parameters.join('/'),
				dimensions: calculated,
			};
		};

		return {
			crop: crop,
		};
	}

	/**
	 * Operates on instance of 'cropper' and returns a string url
	 *
	 * @param {string} url: the provided url which contains original image info
	 * @param {string} mode: requested fitting mode
	 * @param {integer} dpr: system devicePixelRatio setting
	 * @return {object} object containing crop factory and extracted focalPoint
	 */
	function umbraco (url, mode, dpr) {
		var imagePath = url.slice(0, url.indexOf('?'));
		var parameters = url.slice(url.indexOf('?') + 1, url.length).split('&');

		var calculated = null;
		var translatedMode = null;
		var immutableParameters = [];
		var imageDimensions = null;
		var focalPoint = null;

		// Find sky-crop mode name
		var modeTranslater = function (term) {
			var terms = {
				pad: 'contain',
				boxpad: 'contain',
				contain: 'contain',
				min: 'cover',
				max: 'cover',
				cover: 'cover',
				crop: 'cover',
				width: 'width',
				height: 'height',
			};

			return terms[term];
		};
		translatedMode = modeTranslater(mode);

		// Set parameters for return url
		var heightOrWidth = function (string) { return string.indexOf('height') !== -1 || string.indexOf('width') !== -1; };

		// Finds all parameters which will returned untouched
		immutableParameters = parameters.filter(function (param) { return !heightOrWidth(param); });

		imageDimensions = parameters.reduce(function (acc, cur) {
			if (heightOrWidth(cur)) {
				acc[cur.split('=')[0]] = Number(cur.split('=')[1]);
			}

			return acc;
		}, {});

		// Transforms decimal to passable syntax '50%,50%'.
		var useCenterFocal = url.indexOf('anchor=center') !== -1 || url.indexOf('center=') === -1;

		focalPoint = useCenterFocal
			? '50%,50%'
			: immutableParameters.reduce(function (acc, cur) {
				if (cur.indexOf('center') !== -1) {
					acc = (Number(cur.split('=')[1].split(',')[1]) * 100) + "%,";
					acc += (Number(cur.split('=')[1].split(',')[0]) * 100) + "%";
				}

				return acc;
			}, '');

		/**
		 * Factory creating cropping url and extracting new image dimensions.
		 *
		 * @param {object} container: container information
		 * @return {object} object containing crop url and extracted dimensions object
		 */
		var crop = function (container) {
			var mutatedParameters = [];
			calculated = cropper(imageDimensions, container, translatedMode, dpr);

			Object.keys(calculated).forEach(function (key) {
				if (key !== 'ratio') {
					mutatedParameters.push((key + "=" + (calculated[key])));
				}
			});

			return {
				url: (imagePath + "?" + (immutableParameters.join('&')) + "&" + (mutatedParameters.join('&'))),
				dimensions: calculated,
			};
		};

		return {
			crop: crop,
			focalPoint: focalPoint,
		};
	}

	/**
	 * Initiated cropping based on image source.
	 *
	 * @param {string} src: image original source
	 * @param {string} mode: requested fitting mode
	 * @param {integer} dpr: system devicePixelRatio setting
	 * @return {function} cropping functionallity from the needed platform
	 */
	function platformProvider (src, mode, dpr) {
		// "Key: value"" is equeal to "regEx: required job"
		var sourceCollection = {
			'source.unsplash': unsplash,
			media: umbraco,
		};

		// Finds first key which has a match in src and assigns it to 'const key'
		var key = Object.keys(sourceCollection).find(function (regEx) { return src.indexOf(regEx) !== -1; });

		return key === undefined
			? sourceCollection['media'](src, mode, dpr)
			: sourceCollection[key](src, mode, dpr);
	}

	/**
	 * Provides a dummy container setting and factory to initiate a setup
	 * based on a real domElement
	 *
	 * @return {object} factory exploiting container information.
	 */
	function containerProvider () {
		var dimensions = {
			width: 640,
			height: 360,
			ratio: 320 / 180,
		};

		/**
		 * Provides a container factory which container nessesary functionallty
		 * concerning the container to be exploited
		 *
		 * @param {domElement} parentElement: the image's imediate parent (typical div.sky-crop)
		 * @param {domtElement | string} requestedContainer: domElement or selector to be the container
		 * @return {object} exploiting container information.
		 */
		var domBasedSetup = function (parentElement, requestedContainer) {
			var selectedContainer = requestedContainer || 'sky-crop';

			// Recursive function returning a domElement
			// if input: container is a domElement it will be returned immediately
			var getContainer = function (currentElement, container) {
				if (typeof container !== 'string') {
					return container;
				}

				if (currentElement.className.indexOf(container) === -1) {
					return getContainer(currentElement.parentNode, container);
				}

				return currentElement;
			};

			var element = getContainer(parentElement, selectedContainer);

			dimensions.width = element.clientWidth;
			dimensions.height = element.clientHeight;
			dimensions.ratio = element.clientWidth / element.clientHeight;

			var reMeasure = function () {
				dimensions.width = element.clientWidth;
				dimensions.height = element.clientHeight;
				dimensions.ratio = dimensions.width / dimensions.height;
			};

			return {
				element: element,
				dimensions: dimensions,
				reMeasure: reMeasure,
			};
		};

		return {
			dimensions: dimensions,
			domBasedSetup: domBasedSetup,
		};
	}

	/**
	 * Provides booleans indication if and action should be startet or not
	 *
	 * @param {object} container: calculated container information.
	 * @param {object} image: calculated image dimensions.
	 * @param {object} config: configuration object send from image based on requested setup.
	 * @return {object} properties which will resolve to true if the image should be recropped
	 */
	function conditionProvider (container, image, config) {
		var upperLimit = function (dimension) { return Math.ceil((image[dimension] / config.dpr) + config.round); };

		var imageFullyVisible = true;

		var restyle = function () {
			if ((container.dimensions.ratio > image.ratio) && !imageFullyVisible) {
				imageFullyVisible = true;
				return true;
			}

			if ((container.dimensions.ratio < image.ratio) && imageFullyVisible) {
				imageFullyVisible = false;
				return true;
			}

			if (container.dimensions.ratio === image.ratio) {
				imageFullyVisible = true;
				return true;
			}

			return false;
		};

		var recrop = {
			width: function () { return container.dimensions.width > upperLimit('width'); },
			height: function () { return container.dimensions.height > upperLimit('height'); },
			contain: function () { return recrop.width() && recrop.height(); },
			cover: function () { return recrop.width() || recrop.height(); },
		};

		return {
			recrop: recrop[config.mode],
			restyle: restyle,
		};
	}

	/**
	 * Provides a style factory based on inputs
	 *
	 * @param {object} image: calculated image dimensions.
	 * @param {string} requestedFocal: string with focal percentage
	 * @param {object} config: configuration object send from image based on requested setup.
	 * @return {function} factory function to set the correct styles.
	 */
	function styleProvider (image, container, requestedFocal, config) {
		// Settting fallback if requested is empty
		var checkFocal = function (inputFocal) {
			var isValid = !!inputFocal;

			/** Making sure string is correct. Syntax: 'x%,x%' (no zero prefix needed) */
			isValid = (isValid && inputFocal.indexOf(',') !== -1);
			isValid = (isValid && inputFocal.indexOf('%') >= 1);
			isValid = (isValid && inputFocal.indexOf('%') !== inputFocal.lastIndexOf('%'));

			if (!isValid && inputFocal !== undefined) {
				console.warn(("Sky-crop: Invalid focalpoint '" + inputFocal + "' - focalpoint defaulted to: '50%,50%'"));
			}

			return isValid ? inputFocal : '50%,50%';
		};
		var focalString = checkFocal(requestedFocal);

		// Splitting focal info into ints
		var focal = {
			x: Number(focalString.split(',')[0].replace('%', '')),
			y: Number(focalString.split(',')[1].replace('%', '')),
		};

		// Objectfit & -position styles
		var objectFitStyles = {
			cover: function () { return ({
				objectFit: config.mode,
				objectPosition: ("left " + (focal.x) + "% top " + (focal.y) + "%"),
				height: '100%',
				width: '100%',
			}); },
			contain: function () { return ({
				objectFit: config.mode,
				objectPosition: '50% 50%',
				height: '100%',
				width: '100%',
			}); },
		};

		var styles = {
			// If the image has a dimensions smaller than the container.
			center: {
				x: {
					width: 'auto',
					height: '100%',
					top: ((focal.y) + "%"),
					left: '50%',
					transform: ("translate(-50%, -" + (focal.y) + "%)"),
				},
				y: {
					width: '100%',
					height: 'auto',
					top: '50%',
					left: ((focal.x) + "%"),
					transform: ("translate(-" + (focal.x) + "%, -50%)"),
				},
			},
			coverFit: {
				// if the container has a dimensions smaller than the image
				x: {
					width: '100%',
					height: 'auto',
					top: ((focal.y) + "%"),
					left: ((focal.x) + "%"),
					transform: ("translate(-" + (focal.x) + "%, -" + (focal.y) + "%)"),
				},
				y: {
					width: 'auto',
					height: '100%',
					top: ((focal.y) + "%"),
					left: ((focal.x) + "%"),
					transform: ("translate(-" + (focal.x) + "%, -" + (focal.y) + "%)"),
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

		var fitStyles = {
			width: function () {
				var imageFullyVisible = container.dimensions.ratio >= image.ratio;
				return imageFullyVisible ? styles.coverFit.x : styles.center.y;
			},
			height: function () {
				var imageFullyVisible = container.dimensions.ratio <= image.ratio;
				return imageFullyVisible ? styles.coverFit.y : styles.center.x;
			},
			contain: function () {
				var containToWidth = container.dimensions.ratio <= image.ratio;
				return containToWidth ? styles.containFit.x : styles.containFit.y;
			},
			cover: function () {
				var coverByWidth = container.dimensions.ratio <= image.ratio;
				return coverByWidth ? styles.coverFit.y : styles.coverFit.x;
			},
		};

		var autoStyles = {
			width: function () { return ({ height: '100%' }); },
			height: function () { return ({ width: '100%' }); },
		};

		/**
		 * Provides a style object
		 *
		 * @return {object} styling object based on initial configuration
		 */
		return function () {
			if (config.auto) {
				return autoStyles[config.auto]();
			}

			if (config.useObjectFit
				&& (config.mode === 'cover' || config.mode === 'contain')) {
				return objectFitStyles[config.mode]();
			}

			return fitStyles[config.mode]();
		};
	}

	/**
	 * Provides configuration object based on requested setup and default behaviour
	 *
	 * @param {object} requested: requested settings changes.
	 * @return {object} object containing setup and enviromental settings.
	 */
	function configProvider (requested) {
		var isClient = typeof window !== 'undefined';
		var supportedModes = ['width', 'height', 'cover', 'contain'];
		var supportsCSS = isClient
			&& Boolean((window.CSS && window.CSS.supports) || window.supportsCSS || false);
		var supportsObjectFit = supportsCSS
			&& window.CSS.supports('object-fit', 'cover')
			&& window.CSS.supports('object-position', '0% 0%');

		var dpr = isClient ? window.devicePixelRatio : 1;
		var round = requested.round || 100;
		var mode = requested.mode || 'width';
		var auto = null;

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
			console.warn(("Sky-crop[configProvider]: '" + (requested.mode) + "' does not exist - 'width' set as fallback. Available modes: " + (supportedModes.join(' | '))));
		}

		if (requested.auto
			&& (requested.auto !== 'height')
			&& (requested.auto !== 'width')) {
			console.warn(("Sky-crop[configProvider]: " + (requested.auto) + " is not a valid value. Use 'width' or 'height'"));
		}

		return {
			useObjectFit: supportsCSS && supportsObjectFit,
			auto: auto,
			mode: mode,
			dpr: dpr,
			round: round,
		};
	}

	function imageInstance (requested) {
		var container = containerProvider();
		var config = configProvider(requested);
		var platform = platformProvider(requested.src, config.mode, config.dpr);
		var cropInformation = platform.crop(container);

		var focal = requested.focal || platform.focalPoint;


		var styling = styleProvider(
			cropInformation.dimensions,
			container,
			focal,
			config);

		// The following is for rerendering on the client.
		var domBasedSetup = function (element) {
			var domContainer = container.domBasedSetup(element, requested.container);
			config = configProvider(requested);

			cropInformation = platform.crop(domContainer);

			var conditions = conditionProvider(
				domContainer,
				cropInformation.dimensions,
				config);

			styling = styleProvider(
				cropInformation.dimensions,
				domContainer,
				focal,
				config);

			var crop = function () {
				domContainer.reMeasure();
				cropInformation = platform.crop(domContainer);
			};

			var recalcStyles = function () { return styling(); };

			var checkRestyleConditions = function () {
				domContainer.reMeasure();
				return conditions.restyle();
			};

			return {
				container: domContainer,
				crop: crop,
				dimensions: cropInformation.dimensions,
				recalcStyles: recalcStyles,
				shouldRecrop: conditions.recrop,
				shouldRestyle: checkRestyleConditions,
				src: cropInformation.url,
				styling: styling(),
				get config() {
					return config;
				},
			};
		};

		return {
			shouldRecrop: function () { return false; },
			shouldRestyle: function () { return false; },
			src: cropInformation.url,
			styling: styling(),
			domBasedSetup: domBasedSetup,
		};
	}

	(function(){ if(typeof document !== 'undefined'){ var head=document.head||document.getElementsByTagName('head')[0], style=document.createElement('style'), css=".sky-crop { position: relative; overflow: hidden; } .sky-crop .element { display: block; position: absolute; top: 0; left: 0; margin: 0; will-change: transform; } .sky-crop .element:first-of-type { position: relative; } "; style.type='text/css'; if (style.styleSheet){ style.styleSheet.cssText = css; } else { style.appendChild(document.createTextNode(css)); } head.appendChild(style); } })();

	var SkyCrop = {render: function(){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:['sky-crop', { 'default': _vm.defaultCrop }]},_vm._l((_vm.imageArray),function(image){return _c('img',{staticClass:"element",style:(image.styling),attrs:{"src":image.src,"alt":_vm.alt},on:{"load":_vm.removeOldElement}})}))},staticRenderFns: [],
		name: 'SkyCrop',
		props: {
			src: {
				type: String,
				required: true,
			},
			container: String,
			mode: String,
			auto: String,
			round: [String, Number],
			focalpoint: String,
			alt: String,
		},
		data: function data() {
			return {
				skyWindow: {
					restyle: null,
					recrop: null,
				},
				imageArray: [],
				image: null,
				defaultCrop: true,
			};
		},
		computed: {
			default: function default$1() {
				return {
					src: this.src,
					container: this.container,
					mode: this.mode,
					auto: this.auto,
					round: this.round,
					focal: this.focalpoint,
				};
			},
		},
		methods: {
			removeOldElement: function removeOldElement() {
				this.imageArray = this.imageArray.slice(-1);
				this.defaultCrop = false;
			},
			newCrop: function newCrop() {
				return this.image.domBasedSetup(this.$el);
			},
			resizeCrop: function resizeCrop() {
				if (this.imageArray[0].shouldRecrop()) {
					this.imageArray = this.imageArray.slice(0, 1);
					this.imageArray.push(this.newCrop());
				}
			},
			resizeRestyle: function resizeRestyle() {
				var this$1 = this;

				this.imageArray.forEach(function (instance) {
					if (instance.shouldRestyle()) {
						this$1.$set(instance, 'styling', instance.recalcStyles());
					}
				});
			},
		},
		created: function created() {
			this.$set(this, 'image', imageInstance(this.default));
			this.imageArray.push(this.image);
		},
		mounted: function mounted() {
			var this$1 = this;

			if (this.auto === 'height') {
				// avoid DOM height change after image load
				var dimension = function (source, search) { return Number(source.substr(source.indexOf(search)).split('&')[0].split('=')[1]); };

				var width = dimension(this.src, 'width');
				var height = dimension(this.src, 'height');
				var ratio = width / height;

				this.$el.style.height = (this.$el.getBoundingClientRect().width / ratio) + "px";

				this.$nextTick(function () {
					this$1.$el.style.height = null;
				});
			}

			if (!this.auto) {
				resize.on(this.resizeRestyle, false);
			}

			resize.on(this.resizeCrop);

			this.imageArray.push(this.newCrop());
		},
		beforeDestroy: function beforeDestroy() {
			if (!this.auto) {
				resize.off(this.resizeRestyle, false);
			}
			resize.off(this.resizeCrop);
		},
	};

	var defaults = {
		registerComponents: true,
	};

	function install(Vue, options) {
		if (install.installed === true) {
			return;
		}

		var ref = Object.assign({}, defaults, options);
		var registerComponents = ref.registerComponents;

		if (registerComponents) {
			Vue.component(SkyCrop.name, SkyCrop);
		}
	}

	exports.SkyCrop = SkyCrop;
	exports.default = install;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
