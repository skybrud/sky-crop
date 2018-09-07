import SkyCrop from './SkyCrop.vue';

const defaults = {
	registerComponents: true,
};

export { SkyCrop };

export default function install(Vue, options) {
	if (install.installed === true) {
		return;
	}

	const { registerComponents } = Object.assign({}, defaults, options);

	if (registerComponents) {
		Vue.component(SkyCrop.name, SkyCrop);
	}
};
