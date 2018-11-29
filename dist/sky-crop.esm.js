var script = {
	name: 'SkyCrop',
	props: {
		src: {
			type: String,
			required: true,
		},
		mode: String,
	},
	data: function data() {
		return {
			cropUrl: null,
		};
	},
	mounted: function mounted() {
		this.cropUrl = this.umbraco(this.src, this.$el.getBoundingClientRect());
	},
	methods: {
		umbraco: function umbraco(src, container) {
			var isWidthOrHeight = function (string) { return (string.indexOf('width') !== -1) || (string.indexOf('height') !== -1); };
			var notWidthOrHeight = function (string) { return (string.indexOf('width') === -1) && (string.indexOf('height') === -1); };
			var ref = src.split('?');
			var path = ref[0];
			var queryString = ref[1];
			var queryParts = queryString.split('&');

			var sourceDimensions = queryParts
				.filter(isWidthOrHeight)
				.reduce(function (acc, cur) {
					var ref = cur.split('=');
					var prop = ref[0];
					var value = ref[1];

					acc[prop] = (value * 1);

					return acc;
				}, {});

			var cropDimensions = this.crop(
				sourceDimensions,
				container
			);

			var cropQuery = queryParts.filter(notWidthOrHeight).concat( this.objectToStringArray(cropDimensions) ).join('&');

			return (path + "?" + cropQuery);
		},
		crop: function crop(source, target) {
			var ratio = target.width / target.height;

			return {
				width: Math.ceil(target.width),
				height: Math.ceil(target.width / ratio),
			};
		},
		objectToStringArray: function objectToStringArray(object, delimiter) {
			if ( delimiter === void 0 ) delimiter = '=';

			return Object
				.keys(object)
				.reduce(function (acc, cur) {
					acc.push(("" + cur + delimiter + (object[cur])));

					return acc;
				}, []);
		}
	},
};

/* script */
            var __vue_script__ = script;
/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"sky-crop"},[_c('img',{staticClass:"sky-crop__image",attrs:{"src":_vm.cropUrl}})])};
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
