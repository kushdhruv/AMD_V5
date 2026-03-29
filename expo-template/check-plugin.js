try {
  const plugin = require('./node_modules/react-native-google-mobile-ads/app.plugin.js');
  console.log('Plugin loaded successfully');
} catch (e) {
  console.error('Failed to load plugin:');
  console.error(e);
}
