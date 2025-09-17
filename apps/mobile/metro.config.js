const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind CSS imports
config.transformer.unstable_allowRequireContext = true;

// CSS support
config.resolver.assetExts.push('css');

module.exports = withNativeWind(config, { input: './global.css' });