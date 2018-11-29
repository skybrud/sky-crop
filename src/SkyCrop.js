export default {
	name: 'SkyCrop',
	props: {
		src: {
			type: String,
			required: true,
		},
		mode: String,
	},
	data() {
		return {
			cropUrl: null,
		};
	},
	mounted() {
		this.cropUrl = this.umbraco(this.src, this.$el.getBoundingClientRect());
	},
	methods: {
		umbraco(src, container) {
			const isWidthOrHeight = string => (string.indexOf('width') !== -1) || (string.indexOf('height') !== -1);
			const notWidthOrHeight = string => (string.indexOf('width') === -1) && (string.indexOf('height') === -1);
			const [ path, queryString ] = src.split('?');
			const queryParts = queryString.split('&');

			const sourceDimensions = queryParts
				.filter(isWidthOrHeight)
				.reduce((acc, cur) => {
					const [ prop, value ] = cur.split('=');

					acc[prop] = (value * 1);

					return acc;
				}, {});

			const cropDimensions = this.crop(
				sourceDimensions,
				container,
			);

			const cropQuery = [
				...queryParts.filter(notWidthOrHeight),
				...this.objectToStringArray(cropDimensions),
			].join('&');

			return `${path}?${cropQuery}`;
		},
		crop(source, target) {
			const ratio = target.width / target.height;

			return {
				width: Math.ceil(target.width),
				height: Math.ceil(target.width / ratio),
			};
		},
		objectToStringArray(object, delimiter = '=') {
			return Object
				.keys(object)
				.reduce((acc, cur) => {
					acc.push(`${cur}${delimiter}${object[cur]}`);

					return acc;
				}, []);
		}
	},
};