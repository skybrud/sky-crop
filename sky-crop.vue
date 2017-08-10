<script>
import 'core-js/fn/promise';
import skyWindow from 'sky-window';
import imageInstance from './factories/image';

export default {
	props: {
		src: {
			type: String,
			required: true,
		},
		ancestorClass: {
			type: String,
			default: 'sky-crop',
		},
		mode: {
			type: String,
			default: 'width',
		},
		round: {
			type: [String, Number],
			default: 100,
		},
		focalpoint: {
			type: String,
			default: null,
			validator(value) {
				let isValid = true;

				/** Making sure string is correct. Syntax: 'x%,x%' (no zero prefix needed) */
				isValid = (isValid && value.indexOf(',') !== -1);
				isValid = (isValid && value.indexOf('%') >= 1 && value.indexOf('%') <= 2);
				isValid = (isValid && value.lastIndexOf('%') >= 4 && value.lastIndexOf('%') <= 6);
				isValid = (isValid && value.length >= 5 && value.length <= 7);

				if (!isValid) {
					console.info(`Focalpoint invalid value: '${value}', allowed syntax: '50%,5%'`);
				}

				return isValid;
			},
		},
		alt: String,
	},
	data() {
		return {
			imageArray: [],
		};
	},
	methods: {
		removeOldElement() {
			this.imageArray = this.imageArray.slice(-1);
		},
		newCrop() {
			return imageInstance(
				this.$el,
				this.src,
				this.ancestorClass,
				this.mode,
				this.round,
				this.focalpoint);
		},
	},
	mounted() {
		this.imageArray.push(this.newCrop());

		skyWindow.resize.subscribe(() => {
			this.imageArray.forEach((instance) => {
				if (instance.recropCondition) {
					this.imageArray = this.imageArray.slice(0, 1);
					this.imageArray.push(this.newCrop());
				} /*else {
					instance.recalcStyles();
				}*/
			});
		});

		skyWindow.instantResize.subscribe(() => {
			this.imageArray.forEach((instance) => {
				if (!instance.recropCondition) {
					instance.recalcStyles();
				}
			});
		});
	},
	destroy() {
		skyWindow.resize.unsubscribe();
		skyWindow.instantResize.unsubscribe();
	},
};
</script>

<template src="./sky-crop.html"></template>
<style src="./sky-crop.scss"></style>
