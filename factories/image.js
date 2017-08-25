import platformProvider from './platformProvider';
import containerProvider from './containerProvider';
import conditionProvider from './conditionProvider';
import styleProvider from './styleProvider';
import configProvider from './configProvider';

export default (requested) => {
	const container = containerProvider();
	let config = configProvider(requested);
	const platform = platformProvider(requested.src, config.mode, config.dpr);
	let cropInformation = platform.crop(container);

	const focal = requested.focal || platform.focalPoint;

	let styling = styleProvider(
		cropInformation.dimensions,
		container,
		focal,
		config);

	// The following is for rerendering on the client.
	const domBasedSetup = (element) => {
		const domContainer = container.domBasedSetup(element, requested.container);
		config = configProvider(requested);

		cropInformation = platform.crop(domContainer);

		const conditions = conditionProvider(
				domContainer,
				cropInformation.dimensions,
				config);

		styling = styleProvider(
			cropInformation.dimensions,
			domContainer,
			focal,
			config);

		const crop = () => {
			domContainer.reMeasure();
			cropInformation = platform.crop(domContainer);
		};

		const recalcStyles = () => styling();

		const checkRestyleConditions = () => {
			domContainer.reMeasure();
			return conditions.restyle();
		};

		return {
			container: domContainer,
			crop,
			dimensions: cropInformation.dimensions,
			recalcStyles,
			shouldRecrop: conditions.recrop,
			shouldRestyle: checkRestyleConditions,
			src: cropInformation.url,
			styling: styling(),
			get config() {
				return config;
			},
		};
	};

	return {
		src: cropInformation.url,
		styling: styling(),
		domBasedSetup,
	};
};
