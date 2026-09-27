import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.violetloveai.jellyshelf',
  appName: 'JellyShelf',
  webDir: 'dist-native',
  server: { hostname: 'localhost', iosScheme: 'capacitor' },
  ios: { backgroundColor: '#f8f3eb', contentInset: 'never', preferredContentMode: 'mobile' },
};

export default config;
