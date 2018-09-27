import resize from './helpers/resize';
import imageInstance from './factories/image';

export default {
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

			const calculatedHeight = this.$el.getBoundingClientRect().width / ratio;

			if (calculatedHeight) {
				this.$el.style.height = `${calculatedHeight}px`;
			}

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