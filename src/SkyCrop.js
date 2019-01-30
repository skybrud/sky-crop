import objectFitImages from 'object-fit-images';
import resize from './helpers/resize';

const defaultOptions = {
	upscale: false,
};

const webPsupport = (function() {
	const webP = new Image();
	webP.onload = WebP.onerror = function () {
	  callback(webP.height == 2);
	};
	webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
});

export default {
	name: 'SkyCrop',
	props: {
		src: {
			type: String,
			required: true,
		},
		mode: {
			type: String,
			default: '',
		},
		round: {
			type: Number,
			default: 100,
		},
		options: {
			// All available methods: http://imageprocessor.org/imageprocessor-web/imageprocessingmodule/
			type: Object,
			default: () => ({}),
		},
	},
	data() {
		return {
			cropArray: [],
			upperLimit: {},
			loading: false,
			config: Object.assign({},
				defaultOptions,
				this.options,
			),
		};
	},
	computed: {
		rootClasses() {
			return [
				'sky-crop',
				`sky-crop--${this.mode}`,
			];
		},
		imageClasses() {
			return [
				'sky-crop__image',
				`sky-crop__image--${this.mode}`,
			];
		},
		imageAlterations() {
			return Object.keys(this.config).reduce((acc, cur) => {
				acc.push(`${cur}=${this.config[cur]}`);
				return acc;
			}, []);
		},
	},
	watch: {
		loading() {
			this.$emit('loading', this.loading);
		},
	},
	mounted() {
		// Force initiation to be further back in que
		setTimeout(() => {
			this.initiateCrop(this.$el.getBoundingClientRect());
		}, 0);

		resize.on(this.resizeHandler);
	},
	beforeDestroy() {
		resize.off(this.resizeHandler);
	},
	methods: {
		initiateCrop(container) {
			// Only initiate when container has dimensions in order to avoid full image fetch;
			if (!!(container.width || container.height)) {
				this.loading = true;

				this.cropArray.push(this.umbraco(
					this.src,
					container,
					this.mode,
					this.round
				));
			} else {
				console.info('[SkyCrop]: Container element does not have any dimensions, src:', this.src);
			}
		},
		resizeHandler() {
			const container = this.$el.getBoundingClientRect();

			let initCrop = false;

			Object.keys(this.upperLimit).forEach((dimension) => {
				if (initCrop || container[dimension] > this.upperLimit[dimension]) {
					initCrop = true;
				}
			});

			if (initCrop) {
				this.initiateCrop(container);
			}
		},
		loaded() {
			// Clean old crop urls from array
			this.cropArray = this.cropArray.slice(-1);

			objectFitImages();

			this.loading = false;

			// Loaded event emits the loaded src url, just in case.
			this.$emit('loaded', this.cropArray[0]);
		},
		umbraco(src, container, mode, rounding) {
			const [path, queryPart] = src.split('?');

			function partContains(part) {
				/**
				 * "part" is an index of the array calling filter.
				 * this, is the second variable in the filter function
				 */
				return this.indexOf(part.split('=')[0]) !== -1;
			}

			/** START: Grab sourcedimensions */
			const sourceDimensions = queryPart
				.split('&')
				.filter(partContains, ['width', 'height'])
				.reduce((acc, cur) => {
					const [key, value] = cur.split('=');
					acc[key] = value * 1;

					return acc;
				}, {});
			/** END: Grab sourcedimensions */

			/** START: grab immutable parts */
			const immutables = ['anchor', 'center', 'format', 'rnd'];
			const immutablesArray = queryPart
				.split('&')
				.filter(partContains, immutables);
			/** END: grab immutable parts */

			const cropDimensions = this.crop(
				sourceDimensions,
				container,
				mode,
				rounding,
			);

			/* Add upper limit before new crop*/
			this.$set(this, 'upperLimit', cropDimensions);

			/* Generate query for imageprocessor */
			const cropQuery = [
				...this.objectToStringArray(cropDimensions),
				this.cropMode(mode),
				...immutablesArray,
				...this.imageAlterations,
				this.isWebpSupported && 'format=webp',
			].join('&');

			return `${path}?${cropQuery}`;
		},
		cropMode(mode) {
			const modeMap = {
				cover: 'mode=crop',
				contain: 'mode=max',
			};

			return modeMap[mode] || '';
		},
		isWebpSupported() {
			return webPsupport;
		},
		crop(source, target, mode, rounding) {
			const dpr = window.devicePixelRatio;
			const cacheRound = value => Math.ceil((value * dpr) / rounding) * rounding;

			const cropMap = {
				cover: (function coverCalc() {
					const sourceRatio = source.width / source.height;
					const targetRatio = target.width / target.height;

					let base = null;

					if (sourceRatio > targetRatio) {
						base = cacheRound(target.width);

						return {
							width: base,
							heightratio: target.height / target.width,
						};
					}

					base = cacheRound(target.height);

					return {
						height: base,
						widthratio: target.width / target.height,
					};
				}()),
				contain: (function containCalc() {
					const sourceRatio = source.width / source.height;
					let base = null;

					if (sourceRatio > (target.width / target.height)) {
						base = cacheRound(target.width);

						return {
							width: base,
							height: Math.round(base / sourceRatio),
						};
					}

					base = cacheRound(target.height);

					return {
						height: cacheRound(target.height),
						width: Math.round(base * sourceRatio),
					};
				}()),
				width: {
					width: cacheRound(target.width),
				},
				height: {
					height: cacheRound(target.height),
				},
			};

			return cropMap[mode] || cropMap.width;
		},
		objectToStringArray(object, delimiter = '=') {
			return Object
				.keys(object)
				.reduce((acc, cur) => {
					acc.push(`${cur}${delimiter}${object[cur]}`);

					return acc;
				}, []);
		},
	},
};
