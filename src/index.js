import SkyCrop from './SkyCrop.vue';

const defaults = {
	registerComponents: true,
	cropSettings: {
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

	const { registerComponents, cropSettings } = Object.assign({}, defaults, options);

	if (registerComponents) {
		// Vue.component(SkyCrop.name, SkyCrop);
		Vue.component(SkyCrop.name, Object.assign({}, SkyCrop), {
			computed: {
				settings() {
					console.log(this.dpr);
					return Object.assign({}, {
						dpr: this.dpr || cropSettings.dpr,
						mode: this.mode || cropSettings.mode,
						round: this.round || cropSettings.round,
					})
				},
			}
		});
	}
};
