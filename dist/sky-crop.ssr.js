'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var _throttle = _interopDefault(require('lodash.throttle'));

const _callbacks = [];
const _throttledCallbacks = [];
let _listenerOn = false;

const runCallbacks = () => {
	for (let i = _callbacks.length - 1; i >= 0; i--) {
		_callbacks[i]();
	}
};

const runThrottledCallbacks = _throttle(() => {
	for (let i = _throttledCallbacks.length - 1; i >= 0; i--) {
		_throttledCallbacks[i]();
	}
}, 300);

function onResize() {
	runCallbacks();
	runThrottledCallbacks();
}

function on(fn, throttle = true) {
	const array = (throttle) ? _throttledCallbacks : _callbacks;
	array.push(fn);
	if (typeof window !== 'undefined' && !_listenerOn) {
		window.addEventListener('resize', onResize);
		_listenerOn = true;
	}
}

function off(fn, throttle = true) {
	const array = (throttle) ? _throttledCallbacks : _callbacks;
	const index = array.indexOf(fn);
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
	on,
	off,
};

/**
 * Provides an factory for recropping image
 *
 * @param {string} selector: the selected crop mode
 * @param {object} container: container object containing all relevant informaiton
 * @param {integer} imageRatio: integer representing image height and width relation
 * @return {object} return crop dimensions.
 */
var cropModeProvider = (selector, container, imageRatio, dpr) => {
	const calculated = {};

	const roundValues = object => ({
		width: Math.round(object.width),
		height: Math.round(object.height),
		ratio: object.ratio,
	});

	// TODO: ROUNDING MUST BE IMPLEMENTED DYNAMICLY
	const cacheRound = value => Math.ceil((value * dpr) / 100) * 100;

	const modes = {
		width: () => {
			calculated.width = cacheRound(container.dimensions.width);
			calculated.height = Math.ceil(calculated.width / imageRatio);
			calculated.ratio = imageRatio;

			return roundValues(calculated);
		},
		height: () => {
			calculated.height = cacheRound(container.dimensions.height);
			calculated.width = Math.ceil(calculated.height * imageRatio);
			calculated.ratio = imageRatio;

			return roundValues(calculated);
		},
		cover: () => {
			const ancestorRatio = container.dimensions.width / container.dimensions.height;
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
		contain: () => {
			const ancestorRatio = container.dimensions.width / container.dimensions.height;
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
};

/**
 * Takes crop input and passes it to the cropModeProvider and returns the result generated
 * by the cropModeProvider.
 *
 * @param {object} image: calculated image dimensions.
 * @param {object} container: container information
 * @param {object} mode: requested mode
 * @return {object} returning crop dimensions .
 */
var cropper = (imageDimensions, container, mode, dpr) => {
	const ratio = imageDimensions.width / imageDimensions.height;
	const selectedMode = cropModeProvider(mode, container, ratio, dpr);

	return selectedMode;
};

/**
 * Operates on instance of 'cropper' and returns a string url
 *
 * @param {string} cropUrl: the provided url which contains original image info
 * @param {object} containerDimensions: object containing width and height measures
 * @param {string} mode: requested fitting mode
 * @return {string} compiled src url used as image source
 */
var unsplash = (cropUrl, mode, dpr) => {
	const parameters = cropUrl.split('/');
	const inputWidth = parameters[parameters.length - 1].split('x')[0];
	const inputHeight = parameters[parameters.length - 1].split('x')[1];
	const isNumeric = Boolean(Number(inputWidth)) && Boolean(Number(inputHeight));
	let calculated = null;

	let imageDimensions = {
		width: Number(inputWidth),
		height: Number(inputHeight),
	};

	const crop = (container) => {
		// Fallback if input is missing dimensions
		if (!isNumeric) {
			imageDimensions = Object.assign({}, container.dimensions);
			console.warn(`Module sky-crop: Container dimension used! Provided url did not contain width and/or height parameters '${cropUrl}'`);
		}

		calculated = cropper(imageDimensions, container, mode, dpr);

		parameters[parameters.length - 1] = `${calculated.width}x${calculated.height}`;

		return {
			url: parameters.join('/'),
			dimensions: calculated,
		};
	};

	return {
		crop,
	};
};

/**
 * Operates on instance of 'cropper' and returns a string url
 *
 * @param {string} url: the provided url which contains original image info
 * @param {string} mode: requested fitting mode
 * @param {integer} dpr: system devicePixelRatio setting
 * @return {object} object containing crop factory and extracted focalPoint
 */
var umbraco = (url, mode, dpr) => {
	const imagePath = url.slice(0, url.indexOf('?'));
	const parameters = url.slice(url.indexOf('?') + 1, url.length).split('&');

	let calculated = null;
	let translatedMode = null;
	let immutableParameters = [];
	let imageDimensions = null;
	let focalPoint = null;

	// Find sky-crop mode name
	const modeTranslater = (term) => {
		const terms = {
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
	const heightOrWidth = string => string.indexOf('height') !== -1 || string.indexOf('width') !== -1;

	// Finds all parameters which will returned untouched
	immutableParameters = parameters.filter(param => !heightOrWidth(param));

	imageDimensions = parameters.reduce((acc, cur) => {
		if (heightOrWidth(cur)) {
			acc[cur.split('=')[0]] = Number(cur.split('=')[1]);
		}

		return acc;
	}, {});

	// Transforms decimal to passable syntax '50%,50%'.
	const useCenterFocal = url.indexOf('anchor=center') !== -1 || url.indexOf('center=') === -1;

	focalPoint = useCenterFocal
		? '50%,50%'
		: immutableParameters.reduce((acc, cur) => {
			if (cur.indexOf('center') !== -1) {
				acc = `${Number(cur.split('=')[1].split(',')[1]) * 100}%,`;
				acc += `${Number(cur.split('=')[1].split(',')[0]) * 100}%`;
			}

			return acc;
		}, '');

	/**
	 * Factory creating cropping url and extracting new image dimensions.
	 *
	 * @param {object} container: container information
	 * @return {object} object containing crop url and extracted dimensions object
	 */
	const crop = (container) => {
		const mutatedParameters = [];
		calculated = cropper(imageDimensions, container, translatedMode, dpr);

		Object.keys(calculated).forEach((key) => {
			if (key !== 'ratio') {
				mutatedParameters.push(`${key}=${calculated[key]}`);
			}
		});

		return {
			url: `${imagePath}?${immutableParameters.join('&')}&${mutatedParameters.join('&')}`,
			dimensions: calculated,
		};
	};

	return {
		crop,
		focalPoint,
	};
};

/**
 * Initiated cropping based on image source.
 *
 * @param {string} src: image original source
 * @param {string} mode: requested fitting mode
 * @param {integer} dpr: system devicePixelRatio setting
 * @return {function} cropping functionallity from the needed platform
 */
var platformProvider = (src, mode, dpr) => {
	// "Key: value"" is equeal to "regEx: required job"
	const sourceCollection = {
		'source.unsplash': unsplash,
		media: umbraco,
	};

	// Finds first key which has a match in src and assigns it to 'const key'
	const key = Object.keys(sourceCollection).find(regEx => src.indexOf(regEx) !== -1);

	return key === undefined
		? sourceCollection['media'](src, mode, dpr)
		: sourceCollection[key](src, mode, dpr);
};

/**
 * Provides a dummy container setting and factory to initiate a setup
 * based on a real domElement
 *
 * @return {object} factory exploiting container information.
 */
var containerProvider = () => {
	const dimensions = {
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
	const domBasedSetup = (parentElement, requestedContainer) => {
		const selectedContainer = requestedContainer || 'sky-crop';

		// Recursive function returning a domElement
		// if input: container is a domElement it will be returned immediately
		const getContainer = (currentElement, container) => {
			if (typeof container !== 'string') {
				return container;
			}

			if (currentElement.className.indexOf(container) === -1) {
				return getContainer(currentElement.parentNode, container);
			}

			return currentElement;
		};

		const element = getContainer(parentElement, selectedContainer);

		dimensions.width = element.clientWidth;
		dimensions.height = element.clientHeight;
		dimensions.ratio = element.clientWidth / element.clientHeight;

		const reMeasure = () => {
			dimensions.width = element.clientWidth;
			dimensions.height = element.clientHeight;
			dimensions.ratio = dimensions.width / dimensions.height;
		};

		return {
			element,
			dimensions,
			reMeasure,
		};
	};

	return {
		dimensions,
		domBasedSetup,
	};
};

/**
 * Provides booleans indication if and action should be startet or not
 *
 * @param {object} container: calculated container information.
 * @param {object} image: calculated image dimensions.
 * @param {object} config: configuration object send from image based on requested setup.
 * @return {object} properties which will resolve to true if the image should be recropped
 */
var conditionProvider = (container, image, config) => {
	const upperLimit = dimension => Math.ceil((image[dimension] / config.dpr) + config.round);

	let imageFullyVisible = true;

	const restyle = () => {
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

	const recrop = {
		width: () => container.dimensions.width > upperLimit('width'),
		height: () => container.dimensions.height > upperLimit('height'),
		contain: () => recrop.width() && recrop.height(),
		cover: () => recrop.width() || recrop.height(),
	};

	return {
		recrop: recrop[config.mode],
		restyle,
	};
};

/**
 * Provides a style factory based on inputs
 *
 * @param {object} image: calculated image dimensions.
 * @param {string} requestedFocal: string with focal percentage
 * @param {object} config: configuration object send from image based on requested setup.
 * @return {function} factory function to set the correct styles.
 */
var styleProvider = (image, container, requestedFocal, config) => {
	// Settting fallback if requested is empty
	const checkFocal = (inputFocal) => {
		let isValid = !!inputFocal;

		/** Making sure string is correct. Syntax: 'x%,x%' (no zero prefix needed) */
		isValid = (isValid && inputFocal.indexOf(',') !== -1);
		isValid = (isValid && inputFocal.indexOf('%') >= 1);
		isValid = (isValid && inputFocal.indexOf('%') !== inputFocal.lastIndexOf('%'));

		if (!isValid && inputFocal !== undefined) {
			console.warn(`Sky-crop: Invalid focalpoint '${inputFocal}' - focalpoint defaulted to: '50%,50%'`);
		}

		return isValid ? inputFocal : '50%,50%';
	};
	const focalString = checkFocal(requestedFocal);

	// Splitting focal info into ints
	const focal = {
		x: Number(focalString.split(',')[0].replace('%', '')),
		y: Number(focalString.split(',')[1].replace('%', '')),
	};

	// Objectfit & -position styles
	const objectFitStyles = {
		cover: () => ({
			objectFit: config.mode,
			objectPosition: `left ${focal.x}% top ${focal.y}%`,
			height: '100%',
			width: '100%',
		}),
		contain: () => ({
			objectFit: config.mode,
			objectPosition: '50% 50%',
			height: '100%',
			width: '100%',
		}),
	};

	const styles = {
		// If the image has a dimensions smaller than the container.
		center: {
			x: {
				width: 'auto',
				height: '100%',
				top: `${focal.y}%`,
				left: '50%',
				transform: `translate(-50%, -${focal.y}%)`,
			},
			y: {
				width: '100%',
				height: 'auto',
				top: '50%',
				left: `${focal.x}%`,
				transform: `translate(-${focal.x}%, -50%)`,
			},
		},
		coverFit: {
			// if the container has a dimensions smaller than the image
			x: {
				width: '100%',
				height: 'auto',
				top: `${focal.y}%`,
				left: `${focal.x}%`,
				transform: `translate(-${focal.x}%, -${focal.y}%)`,
			},
			y: {
				width: 'auto',
				height: '100%',
				top: `${focal.y}%`,
				left: `${focal.x}%`,
				transform: `translate(-${focal.x}%, -${focal.y}%)`,
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

	const fitStyles = {
		width: () => {
			const imageFullyVisible = container.dimensions.ratio >= image.ratio;
			return imageFullyVisible ? styles.coverFit.x : styles.center.y;
		},
		height: () => {
			const imageFullyVisible = container.dimensions.ratio <= image.ratio;
			return imageFullyVisible ? styles.coverFit.y : styles.center.x;
		},
		contain: () => {
			const containToWidth = container.dimensions.ratio <= image.ratio;
			return containToWidth ? styles.containFit.x : styles.containFit.y;
		},
		cover: () => {
			const coverByWidth = container.dimensions.ratio <= image.ratio;
			return coverByWidth ? styles.coverFit.y : styles.coverFit.x;
		},
	};

	const autoStyles = {
		width: () => ({ height: '100%' }),
		height: () => ({ width: '100%' }),
	};

	/**
	 * Provides a style object
	 *
	 * @return {object} styling object based on initial configuration
	 */
	return () => {
		if (config.auto) {
			return autoStyles[config.auto]();
		}

		if (config.useObjectFit
			&& (config.mode === 'cover' || config.mode === 'contain')) {
			return objectFitStyles[config.mode]();
		}

		return fitStyles[config.mode]();
	};
};

/**
 * Provides configuration object based on requested setup and default behaviour
 *
 * @param {object} requested: requested settings changes.
 * @return {object} object containing setup and enviromental settings.
 */
var configProvider = (requested) => {
	const isClient = typeof window !== 'undefined';
	const supportedModes = ['width', 'height', 'cover', 'contain'];
	const supportsCSS = isClient
		&& Boolean((window.CSS && window.CSS.supports) || window.supportsCSS || false);
	const supportsObjectFit = supportsCSS
		&& window.CSS.supports('object-fit', 'cover')
		&& window.CSS.supports('object-position', '0% 0%');

	const dpr = isClient ? window.devicePixelRatio : 1;
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

var imageInstance = (requested) => {
	const container = containerProvider();
	let config = configProvider(requested);
	const platform = platformProvider(requested.src, config.mode, config.dpr);
	let cropInformation = platform.crop(container);

	const focal = requested.focal || platform.focalPoint;


	let styling = styleProvider(
		cropInformation.dimensions,
		container,
		focal,
		config);

	// The following is for rerendering on the client.
	const domBasedSetup = (element) => {
		const domContainer = container.domBasedSetup(element, requested.container);
		config = configProvider(requested);

		cropInformation = platform.crop(domContainer);

		const conditions = conditionProvider(
			domContainer,
			cropInformation.dimensions,
			config);

		styling = styleProvider(
			cropInformation.dimensions,
			domContainer,
			focal,
			config);

		const crop = () => {
			domContainer.reMeasure();
			cropInformation = platform.crop(domContainer);
		};

		const recalcStyles = () => styling();

		const checkRestyleConditions = () => {
			domContainer.reMeasure();
			return conditions.restyle();
		};

		return {
			container: domContainer,
			crop,
			dimensions: cropInformation.dimensions,
			recalcStyles,
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
		shouldRecrop: () => false,
		shouldRestyle: () => false,
		src: cropInformation.url,
		styling: styling(),
		domBasedSetup,
	};
};

var script = {
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
		showDefault: {
			type: Boolean,
			default: true,
		},
	},
	data() {
		return {
			skyWindow: {
				restyle: null,
				recrop: null,
			},
			imageArray: [],
			image: null,
			defaultCrop: true,
			loading: true,
		};
	},
	computed: {
		default() {
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
		addImage(image) {
			this.$emit('loading');
			this.loading = true;
			this.imageArray.push(image);
		},
		removeOldImages() {
			this.imageArray = this.imageArray.slice(-1);
			this.defaultCrop = false;
		},
		load() {
			this.removeOldImages();
			this.loading = false;
			this.$emit('load');
		},
		newCrop() {
			return this.image.domBasedSetup(this.$el);
		},
		resizeCrop() {
			if (this.imageArray[0].shouldRecrop()) {
				this.imageArray = this.imageArray.slice(0, 1);
				this.addImage(this.newCrop());
			}
		},
		resizeRestyle() {
			this.imageArray.forEach((instance) => {
				if (instance.shouldRestyle()) {
					this.$set(instance, 'styling', instance.recalcStyles());
				}
			});
		},
	},
	created() {
		this.$set(this, 'image', imageInstance(this.default));
		if (this.showDefault) {
			this.addImage(this.image);
		}
	},
	mounted() {
		if (this.auto === 'height') {
			// avoid DOM height change after image load
			const dimension = (source, search) => Number(source.substr(source.indexOf(search)).split('&')[0].split('=')[1]);

			const width = dimension(this.src, 'width');
			const height = dimension(this.src, 'height');
			const ratio = width / height;

			this.$el.style.height = `${this.$el.getBoundingClientRect().width / ratio}px`;

			this.$nextTick(() => {
				this.$el.style.height = null;
			});
		}

		if (!this.auto) {
			resize.on(this.resizeRestyle, false);
		}

		resize.on(this.resizeCrop);

		this.addImage(this.newCrop());
	},
	beforeDestroy() {
		if (!this.auto) {
			resize.off(this.resizeRestyle, false);
		}
		resize.off(this.resizeCrop);
	},
};

/* script */
            const __vue_script__ = script;
            
/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:['sky-crop', { 'default': _vm.defaultCrop }]},[_vm._ssrNode((_vm._ssrList((_vm.imageArray),function(image,index){return ("<img"+(_vm._ssrAttr("src",image.src))+(_vm._ssrAttr("alt",_vm.alt))+" class=\"element\""+(_vm._ssrStyle(null,image.styling, null))+">")})))])};
var __vue_staticRenderFns__ = [];

  /* style */
  const __vue_inject_styles__ = function (inject) {
    if (!inject) return
    inject("data-v-ae030ff6_0", { source: "\n.sky-crop{position:relative;overflow:hidden;position:absolute;top:0;left:0;margin:0;will-change:transform\n}", map: undefined, media: undefined });

  };
  /* scoped */
  const __vue_scope_id__ = undefined;
  /* module identifier */
  const __vue_module_identifier__ = "data-v-ae030ff6";
  /* functional template */
  const __vue_is_functional_template__ = false;
  /* component normalizer */
  function __vue_normalize__(
    template, style, script$$1,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    const component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "SkyCrop.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) component.functional = true;
    }

    component._scopeId = scope;

    {
      let hook;
      {
        // In SSR.
        hook = function(context) {
          // 2.3 injection
          context =
            context || // cached call
            (this.$vnode && this.$vnode.ssrContext) || // stateful
            (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
          // 2.2 with runInNewContext: true
          if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
            context = __VUE_SSR_CONTEXT__;
          }
          // inject component styles
          if (style) {
            style.call(this, createInjectorSSR(context));
          }
          // register component module identifier for async chunk inference
          if (context && context._registeredComponents) {
            context._registeredComponents.add(moduleIdentifier);
          }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        component._ssrRegister = hook;
      }

      if (hook !== undefined) {
        if (component.functional) {
          // register for functional component in vue file
          const originalRender = component.render;
          component.render = function renderWithStyleInjection(h, context) {
            hook.call(context);
            return originalRender(h, context)
          };
        } else {
          // inject component registration as beforeCreate hook
          const existing = component.beforeCreate;
          component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
      }
    }

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  function __vue_create_injector_ssr__(context) {
    if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
      context = __VUE_SSR_CONTEXT__;
    }

    if (!context) return function () {}

    if (!context.hasOwnProperty('styles')) {
      Object.defineProperty(context, 'styles', {
        enumerable: true,
        get: () => context._styles
      });
      context._renderStyles = renderStyles;
    }

    function renderStyles(styles) {
      let css = '';
      for (const {ids, media, parts} of styles) {
        css +=
          '<style data-vue-ssr-id="' + ids.join(' ') + '"' + (media ? ' media="' + media + '"' : '') + '>'
          + parts.join('\n') +
          '</style>';
      }

      return css
    }

    return function addStyle(id, css) {
      const group = css.media || 'default';
      const style = context._styles[group] || (context._styles[group] = { ids: [], parts: [] });

      if (!style.ids.includes(id)) {
        style.media = css.media;
        style.ids.push(id);
        let code = css.source;
        style.parts.push(code);
      }
    }
  }

  
  var SkyCrop = __vue_normalize__(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    __vue_create_injector_ssr__
  );

const defaults = {
	registerComponents: true,
};

function install(Vue, options) {
	if (install.installed === true) {
		return;
	}

	const { registerComponents } = Object.assign({}, defaults, options);

	if (registerComponents) {
		Vue.component(SkyCrop.name, SkyCrop);
	}
}

exports.SkyCrop = SkyCrop;
exports.default = install;
