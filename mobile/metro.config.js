const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.endsWith('Utilities/Platform')) {
    return context.resolveRequest(
      context,
      'react-native-web/dist/exports/Platform',
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;