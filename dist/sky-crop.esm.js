import _throttle from 'lodash.throttle';
import objectFitImages from 'object-fit-images';

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

var defaultOptions = {
	upscale: false,
};

var optionsBlacklist = 'anchor,center,format,mode,rnd';

var script = {
	name: 'SkyCrop',
	props: {
		src: {
			type: String,
			required: true,
		},
		mode: {
			type: String,
			default: 'width',
		},
		round: {
			type: Number,
			default: 100,
		},
		dpr: {
			type: Number,
			default: 0,
			validator: function (value) { return value >= 0; },
		},
		alt: {
			type: String,
			default: '',
		},
		options: {
			// All available methods: http://imageprocessor.org/imageprocessor-web/imageprocessingmodule/
			type: Object,
			default: function () { return ({}); },
		},
	},
	data: function data() {
		return {
			cropArray: [],
			upperLimit: {},
			loading: false,
			config: Object.assign({},
				defaultOptions,
				this.options
			),
		};
	},
	computed: {
		rootClasses: function rootClasses() {
			return [
				'sky-crop',
				("sky-crop--" + (this.mode)) ];
		},
		imageClasses: function imageClasses() {
			return [
				'sky-crop__image',
				("sky-crop__image--" + (this.mode)) ];
		},
		imageAlterations: function imageAlterations() {
			var this$1 = this;

			return Object.keys(this.config).reduce(function (acc, cur) {
				if (optionsBlacklist.indexOf(cur) === -1) {
					acc.push((cur + "=" + (this$1.config[cur])));
				} else {
					console.log('[SkyCrop]: The selected option property is set as immutable');
				}

				return acc;
			}, []);
		},
	},
	watch: {
		loading: function loading() {
			this.$emit('loading', this.loading);
		},
	},
	mounted: function mounted() {
		// Force initiation to be further back in que
		this.initiateCrop(this.$el.getBoundingClientRect());

		resize.on(this.resizeHandler);
	},
	beforeDestroy: function beforeDestroy() {
		resize.off(this.resizeHandler);
	},
	methods: {
		initiateCrop: function initiateCrop(container, count) {
			var this$1 = this;
			if ( count === void 0 ) count = 0;

			// Only initiate when container has dimensions in order to avoid full image fetch;
			if (!!(container.width || container.height)) {
				this.loading = true;

				this.cropArray.push(this.umbraco(
					this.src,
					container,
					this.mode,
					this.round
				));
			} else if (count === 5) {
				console.info('[SkyCrop]: Container element does not have any dimensions, src:', this.src);
			} else {
				setTimeout(function () {
					this$1.initiateCrop(this$1.$el.getBoundingClientRect(), ++count);
				}, 1000);
			}
		},
		resizeHandler: function resizeHandler() {
			var this$1 = this;

			var container = this.$el.getBoundingClientRect();

			var initCrop = false;

			Object.keys(this.upperLimit).forEach(function (dimension) {
				if (initCrop || container[dimension] > this$1.upperLimit[dimension]) {
					initCrop = true;
				}
			});

			if (initCrop) {
				this.initiateCrop(container);
			}
		},
		loaded: function loaded() {
			// Clean old crop urls from array
			this.cropArray = this.cropArray.slice(-1);

			objectFitImages();

			this.loading = false;

			// Loaded event emits the loaded src url, just in case.
			this.$emit('loaded', this.cropArray[0]);
		},
		umbraco: function umbraco(src, container, mode, rounding) {
			var ref = src.split('?');
			var path = ref[0];
			var queryPart = ref[1];

			function partContains(part) {
				/**
				 * "part" is an index of the array calling filter.
				 * this, is the second variable in the filter function
				 */
				return this.indexOf(part.split('=')[0]) !== -1;
			}

			/** START: Grab sourcedimensions */
			var sourceDimensions = queryPart
				.split('&')
				.filter(partContains, ['width', 'height'])
				.reduce(function (acc, cur) {
					var ref = cur.split('=');
					var key = ref[0];
					var value = ref[1];
					acc[key] = value * 1;

					return acc;
				}, {});
			/** END: Grab sourcedimensions */

			/** START: grab immutable parts */
			var immutables = ['anchor', 'center', 'format', 'rnd'];
			var immutablesArray = queryPart
				.split('&')
				.filter(partContains, immutables);
			/** END: grab immutable parts */

			var cropDimensions = this.crop(
				sourceDimensions,
				container,
				mode,
				rounding
			);

			/* Add upper limit before new crop*/
			this.$set(this, 'upperLimit', cropDimensions);

			/* Generate query for imageprocessor */
			var cropQuery = this.objectToStringArray(cropDimensions).concat( [this.cropMode(mode)],
				immutablesArray,
				this.imageAlterations,
				[this.isWebpSupported() && 'format=webp'] ).join('&');

			return (path + "?" + cropQuery);
		},
		cropMode: function cropMode(mode) {
			var modeMap = {
				cover: 'mode=crop',
				contain: 'mode=max',
			};

			return modeMap[mode] || '';
		},
		isWebpSupported: function isWebpSupported() {
			var webpBrowsers = ['Chrome', 'Firefox'];
			var userAgent = navigator.userAgent;

			return !!webpBrowsers.find(function (browser) { return (userAgent.indexOf(browser) > -1) && (userAgent.indexOf('Edge') === -1); });
		},
		crop: function crop(source, target, mode, rounding) {
			var dpr = this.dpr || window.devicePixelRatio;

			var cacheRound = function (value) { return Math.ceil((value * dpr) / rounding) * rounding; };

			var cropMap = {
				cover: (function coverCalc() {
					var sourceRatio = source.width / source.height;
					var targetRatio = target.width / target.height;

					var base = null;

					if (sourceRatio > targetRatio) {
						base = cacheRound(target.width);

						return {
							width: base,
							heightratio: target.height / target.width,
						};
					}

					base = cacheRound(target.height);

					return {
						height: base,
						widthratio: target.width / target.height,
					};
				}()),
				contain: (function containCalc() {
					var sourceRatio = source.width / source.height;
					var base = null;

					if (sourceRatio > (target.width / target.height)) {
						base = cacheRound(target.width);

						return {
							width: base,
							height: Math.round(base / sourceRatio),
						};
					}

					base = cacheRound(target.height);

					return {
						height: cacheRound(target.height),
						width: Math.round(base * sourceRatio),
					};
				}()),
				width: {
					width: cacheRound(target.width),
				},
				height: {
					height: cacheRound(target.height),
				},
			};

			return cropMap[mode] || cropMap.width;
		},
		objectToStringArray: function objectToStringArray(object, delimiter) {
			if ( delimiter === void 0 ) delimiter = '=';

			return Object
				.keys(object)
				.reduce(function (acc, cur) {
					acc.push(("" + cur + delimiter + (object[cur])));

					return acc;
				}, []);
		},
	},
};

/* script */
            var __vue_script__ = script;
/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{class:_vm.rootClasses},_vm._l((_vm.cropArray),function(url,index){return _c('img',{key:index,ref:"image",refInFor:true,class:_vm.imageClasses,attrs:{"src":url,"alt":_vm.alt},on:{"load":_vm.loaded}})}))};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* component normalizer */
  function __vue_normalize__(
    template, style, script$$1,
    scope, functional, moduleIdentifier,
    createInjector, createInjectorSSR
  ) {
    var component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

    // For security concerns, we use only base name in production mode.
    component.__file = "SkyCrop.vue";

    if (!component.render) {
      component.render = template.render;
      component.staticRenderFns = template.staticRenderFns;
      component._compiled = true;

      if (functional) { component.functional = true; }
    }

    component._scopeId = scope;

    return component
  }
  /* style inject */
  
  /* style inject SSR */
  

  
  var SkyCrop = __vue_normalize__(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );

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

export default install;
export { SkyCrop };
