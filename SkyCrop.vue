<script>
import SkyWindow from 'SkyWindow';
import imageInstance from './factories/image';

export default {
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
	data() {
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
		removeOldElement() {
			this.imageArray = this.imageArray.slice(-1);
			this.defaultCrop = false;
		},
		newCrop() {
			return this.image.domBasedSetup(this.$el);
		},
	},
	created() {
		this.$set(this, 'image', imageInstance(this.default));
		this.imageArray.push(this.image);
	},
	mounted() {
		this.imageArray.push(this.newCrop());

		// Only set restyle listener if the mode isn't forced.
		if (!this.auto) {
			this.skyWindow.restyle = SkyWindow.instantResize.subscribe(() => {
				this.imageArray.forEach((instance) => {
					if (instance.shouldRestyle()) {
						this.$set(instance, 'styling', instance.recalcStyles());
					}
				});
			});
		}

		this.skyWindow.recrop = SkyWindow.resize.subscribe(() => {
			if (this.imageArray[0].shouldRecrop()) {
				this.imageArray = this.imageArray.slice(0, 1);
				this.imageArray.push(this.newCrop());
			}
		});
	},
	beforeDestroy() {
		if (this.skyWindow.recrop) {
			this.skyWindow.recrop.unsubscribe();
		}

		if (this.skyWindow.restyle) {
			this.skyWindow.restyle.unsubscribe();
		}
	},
};
</script>

<template src="./SkyCrop.html"></template>
<style src="./SkyCrop.scss"></style>
