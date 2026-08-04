module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Required by react-native-reanimated v4 (worklets moved to their own
    // package) — must be listed last. Without it, any module that imports
    // reanimated fails its native/JSI init check at require-time; since
    // Expo Router eagerly requires every route file to build the nav tree,
    // that throw happens unconditionally at app boot, before anything
    // renders — an uncaught exception in a release build kills the whole
    // process instead of showing a JS red screen, which is exactly the
    // "closes immediately every time" crash reported on Android.
    plugins: ['react-native-worklets/plugin'],
  };
};
