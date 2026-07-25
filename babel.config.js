/**
 * babel.config.js · RN 0.86 + reanimated 4.5.3 + worklets 0.11.2
 * 教训(2026-07-24 hwf-clone v0.3 ship):plugin 名是 react-native-worklets/plugin,
 * 不是 react-native-reanimated/plugin(reanimated 4 已拆出 worklets 独立包)
 */
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
};
