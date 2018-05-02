import SkyCrop from './SkyCrop.vue';

const defaults = {
	registerComponents: true,
};

export { SkyCrop };

export default {
	install(Vue, options) {
		const { registerComponents } = Object.assign({}, defaults, options);

		if (registerComponents) {
			Vue.component(SkyCrop.name, SkyCrop);
		}
	},
};
