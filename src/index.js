import SkyCrop from './SkyCrop.vue';

const defaults = {
	registerComponents: true,
	defaultSettings: {
		dpr: 0,
		mode: 'width',
		round: 100,
	},
};

export { SkyCrop };

export default function install(Vue, options) {
	if (install.installed === true) {
		return;
	}

	const { registerComponents, defaultSettings } = Object.assign({}, defaults, options);

	if (registerComponents) {
		// Vue.component(SkyCrop.name, SkyCrop);
		Vue.component(SkyCrop.name, Object.assign(
			{},
			SkyCrop,
			{
				computed: {
					settings() {
						return Object.assign({}, defaultSettings, this.localSettings);
					},
				},
			}
		));
	}
};
