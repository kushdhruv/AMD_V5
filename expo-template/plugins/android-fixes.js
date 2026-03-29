const { withAndroidManifest, withDangerousMod, withPlugins } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

/**
 * Aggressively ensures the FileSystemFileProvider is in the manifest with tools:replace.
 */
const withManifestFix = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    
    // Add tools namespace if missing
    if (!androidManifest.manifest.$['xmlns:tools']) {
      androidManifest.manifest.$['xmlns:tools'] = 'http://schemas.android.com/tools';
    }

    const mainApplication = androidManifest.manifest.application[0];
    const providers = mainApplication.provider || [];

    // Find or Create the FileSystemFileProvider
    let provider = providers.find(p => p.$['android:name'] === 'expo.modules.filesystem.FileSystemFileProvider');
    if (!provider) {
      provider = {
        '$': {
          'android:name': 'expo.modules.filesystem.FileSystemFileProvider',
          'android:authorities': `${config.android.package}.FileSystemFileProvider`,
          'android:exported': 'false',
          'android:grantUriPermissions': 'true',
          'tools:replace': 'android:authorities'
        },
        'meta-data': [
          {
            '$': {
              'android:name': 'android.support.FILE_PROVIDER_PATHS',
              'android:resource': '@xml/file_system_provider_paths'
            }
          }
        ]
      };
      providers.push(provider);
      mainApplication.provider = providers;
    } else {
      provider.$['tools:replace'] = 'android:authorities';
      provider.$['android:authorities'] = `${config.android.package}.FileSystemFileProvider`;
    }

    // Add UPI queries for canOpenURL to work on Android 11+
    if (!androidManifest.manifest.queries) {
      androidManifest.manifest.queries = [{
        intent: [
          { 
            action: { $: { 'android:name': 'android.intent.action.VIEW' } }, 
            data: { $: { 'android:scheme': 'upi' } } 
          }
        ]
      }];
    }
    
    return config;
  });
};

/**
 * Plugin to automatically create the res/xml/file_system_provider_paths.xml resource.
 */
const withFileSystemProviderPaths = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const resPath = path.join(config.modRequest.projectRoot, 'android', 'app', 'src', 'main', 'res');
      const xmlDir = path.join(resPath, 'xml');
      
      if (!fs.existsSync(xmlDir)) {
        fs.mkdirSync(xmlDir, { recursive: true });
      }
      
      const filePath = path.join(xmlDir, 'file_system_provider_paths.xml');
      const content = `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="external_files" path="."/>
</paths>`;
      
      fs.writeFileSync(filePath, content);
      return config;
    },
  ]);
};

module.exports = (config) => {
  return withPlugins(config, [
    withManifestFix,
    withFileSystemProviderPaths,
  ]);
};
