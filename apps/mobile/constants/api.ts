import Constants from 'expo-constants';

// Dynamically resolve the Local IP address of the Expo Bundler
// This prevents 'Network request failed' or 'Scanner Backend not reachable' errors
// when testing on physical physical devices whose IP randomly changes.
const getBackendUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  if (__DEV__) {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const localIp = hostUri.split(':')[0];
      return `http://${localIp}:3000`;
    }
    // Fallback if Constants is unavailable
    return 'http://192.168.47.92:3000';
  }
  
  return 'https://api.phygital-trace.com';
};

export const API_URL = getBackendUrl();
