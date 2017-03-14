<script>
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
			round: String,
			type: {
				type: String,
				default: 'img',
				required: false,
			},
		},
		data() {
			return {
				image: new ImageObject(this.src),
				srcString: '',
				styleObject: { },
			};
		},
		methods: {
			anchorString(image) {
				if (this.$el.firstChild.localName !== 'img') {
					this.$set(this.styleObject, 'background-position', `${image.anchor.x} ${image.anchor.y}`);
				} else {
					/* Convert anchor % to decimal */
					const pointX = Number(image.anchor.x.replace('%', '')) / 100;
					const pointY = Number(image.anchor.y.replace('%', '')) / 100;

					/* Finding difference in size between parent and original image */
					const differenceX = image.parent.width - image.calculatedInfo.width;
					const differenceY = image.parent.height - image.calculatedInfo.height;

					/* Setting focal point relative to difference in size */
					const anchorX = Math.min(0, differenceX * pointX);
					const anchorY = Math.min(0, differenceY * pointY);

					this.$set(this.styleObject, 'transform', `translate(${anchorX}px, ${anchorY}px)`);
				}
			},
			concatSrc(string) {
				/* By default always set a string with the output url */
				this.srcString = string;

				/* If element is div - use src in a background-image */
				if (this.type !== 'img') {
					this.$set(this.styleObject, 'background-image', `url(${this.srcString})`);
				}
			},
		},
		created() {
			/**
			 *	When instance is instantiated set image props with attr values
			 *	- if attr is set the corresponding image property is updated.
			 */
			if (this.mode) {
				this.image.mode = this.mode;
			}
			if (this.round) {
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
			/* When instance is mounted in DOM, start methods with DOM info dependencies */
			this.image.setParentInfo(this.$el);
			this.image.runCropJob();
			this.anchorString(this.image);
			this.concatSrc(this.image.outputUrl);
		},
	};
</script>

<style src="./sky-crop.scss"></style>
<template src="./sky-crop.html"></template>
