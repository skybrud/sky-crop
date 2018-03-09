const SkyBuildSetup = require('sky-build-setup');
const PackageJson = require('./package.json');
const path = require('path');

console.log('MODULE', path.resolve(__dirname));

module.exports = SkyBuildSetup(
	PackageJson.name,
	PackageJson.build,
	path.resolve(__dirname)
);