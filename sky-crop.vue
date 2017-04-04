<script>
	import SkyWindow from 'sky-window';
	import ImageObject from './SkyCropImage.class';

	export default {
		name: 'sky-crop',
		props: {
			src: {
				type: String,
				required: true,
			},
			focalpoint: {
				type: String,
				validator(value) {
					let isValid = true;

					/** Making sure string is correct. Syntax: 'x%,x%' (no zero prefix needed) */
					isValid = (isValid && value.indexOf(',') !== -1);
					isValid = (isValid && value.indexOf('%') >= 1 && value.indexOf('%') <= 2);
					isValid = (isValid && value.lastIndexOf('%') >= 4 && value.lastIndexOf('%') <= 6);
					isValid = (isValid && value.length >= 5 && value.length <= 7);

					if (!isValid) {
						console.warn(`Focalpoint invalid value: '${value}', allowed syntax is: '50%,5%' / '50%,05%' - zero-prefix is optional`);
					}

					return isValid;
				},
			},
			mode: String,
			round: [String, Number],
			type: {
				type: String,
				default: 'img',
			},
			alt: String,
			parentId: String,
		},
		data() {
			return {
				image: this.image || new ImageObject(this.src),
				srcString: '',
				altText: this.alt,
				styleObject: { },
			};
		},
		methods: {
			setAnchor(image) {
				const vm = this;
				image.calculatedInfo.styles.forEach((style) => {
					if (style.name === 'transform'
					|| style.name === 'background-position') {
						vm.$set(vm.styleObject, style.name, style.value);
					}
				});
			},
			loadSource(image) {
				/*
				 * Delay setting actual source until image url has already been loaded
				 * to cache by using 'const img' to prefetch
				 */
				const img = new Image();

				const load = () => {
					this.setSource(image);

					/* Cleanup event listeners */
					img.removeEventListener('load', load);
					img.removeEventListener('error', load);
				};

				/* Run load function both when img loads and errors (just for fallback) */
				img.addEventListener('load', load);
				img.addEventListener('error', load);

				/* Set img src - now just waiting for events */
				img.src = image.outputUrl;
			},
			setSource(image) {
				const vm = this;

				/* By default always set a string with the output url */
				this.srcString = image.outputUrl;

				image.calculatedInfo.styles.forEach((style) => {
					vm.$set(vm.styleObject, style.name, style.value);
				});
			},
			update() {
				/* When instance is mounted in DOM, start methods with DOM info dependencies */
				this.image.setParentInfo(this.$el);
				this.image.runCropJob(this.type === 'img');
				if (this.srcString && this.srcString !== this.image.outputUrl) {
					this.loadSource(this.image);
				} else {
					this.setSource(this.image);
				}
			},
		},
		created() {
			/*
			 *	When instance is instantiated set image props with attr values
			 *	- if attr is set the corresponding image property is updated.
			 */
			if (this.mode) {
				this.image.mode = this.mode;
			}
			if (!isNaN(Number(this.round))) {
				this.image.round = this.round;
			}
			if (this.focalpoint) {
				this.image.anchor = {
					x: this.focalpoint.split(',')[0],
					y: this.focalpoint.split(',')[1],
				};
			}
		},
		mounted() {
			this.update();

			SkyWindow.resize.subscribe(() => {
				if (this.$el.clientWidth > this.image.calculatedInfo.width
				|| this.$el.clientWidth < this.image.calculatedInfo.width - this.image.round
				|| this.$el.clientHeight > this.image.calculatedInfo.height
				|| this.$el.clientHeight < this.image.calculatedInfo.height - this.image.round) {
					/* Rerun entire crop process */
					this.update();
				} else {
					/* Recalculate anchorpoint with the new parent dimensions */
					this.image.setParentInfo(this.$el);
				}
				this.setAnchor(this.image);
			});
		},
		destroy() {
			SkyWindow.resize.unsubscribe();
		},
	};
</script>

<style src="./sky-crop.scss"></style>
<template src="./sky-crop.html"></template>
