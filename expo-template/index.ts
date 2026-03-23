// No URL polyfill needed in modern RN/Expo


import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { registerRootComponent } from 'expo';
import { Alert } from 'react-native';

import App from './App';

// Global error handler to catch JS crashes and display them instead of silent crash
(global as any).ErrorUtils?.setGlobalHandler((error: Error, isFatal: boolean) => {
  console.error('[Global Error]', error);
  
  // Try to alert, but catch if Alert system itself is not ready
  try {
    Alert.alert(
      isFatal ? '⚠️ FATAL CRASH' : '❌ ERROR',
      error.message + '\n\n' + (error.stack || '').split('\n').slice(0, 3).join('\n'),
      [{ text: 'OK', onPress: () => isFatal && process.exit(1) }]
    );
  } catch (alertError) {
    // If Alert fails, just log it. In standalone builds, logs are hard to see, but this prevents self-crash.
    console.error('Failed to show error alert', alertError);
  }
});

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
