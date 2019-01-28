import objectFitImages from 'object-fit-images';

const defaultOptions = {
	upscale: false,
};

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
			type: Array,
			default: () => ({}),
		},
	},
	data() {
		return {
			cropUrl: null,
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
	mounted() {
		this.cropUrl = this.umbraco(
			this.src,
			this.$el.getBoundingClientRect(),
			this.mode,
			this.round,
		);

		objectFitImages();

		resize.on(this.resizeCrop);
	},
	beforeDestroy() {
		if (!this.auto) {
			resize.off(this.resizeRestyle, false);
		}
		resize.off(this.resizeCrop);
	},
	methods: {
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

			/* Generate query for imageprocessor */
			const cropQuery = [
				...this.objectToStringArray(cropDimensions),
				this.cropMode(mode),
				...immutablesArray,
				this.imageAlterations,
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
		crop(source, target, mode, rounding) {
			const dpr = window.devicePixelRatio;
			const cacheRound = value => Math.ceil((value * dpr) / rounding) * rounding;

			const cropMap = {
				cover: {
					width: cacheRound(target.width),
				},
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
