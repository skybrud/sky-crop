<script>
import skyWindow from 'sky-window';
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
			this.skyWindow.restyle = skyWindow.instantResize.subscribe(() => {
				this.imageArray.forEach((instance) => {
					if (instance.shouldRestyle()) {
						this.$set(instance, 'styling', instance.recalcStyles());
					}
				});
			});
		}

		this.skyWindow.recrop = skyWindow.resize.subscribe(() => {
			if (this.imageArray[0].shouldRecrop()) {
				this.imageArray = this.imageArray.slice(0, 1);
				this.imageArray.push(this.newCrop());
			}
		});
	},
	destroy() {
		this.skyWindow.recrop.unsubscribe();
		this.skyWindow.restyle.unsubscribe();
	},
};
</script>

<template src="./sky-crop.html"></template>
<style src="./sky-crop.scss"></style>
