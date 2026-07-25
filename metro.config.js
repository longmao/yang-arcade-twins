const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * 修复 Metro 扫到隔壁 expo 项目 (yang-buhuo-daily) 的红屏错误
 * projectRoot 锁 yang-arcade-twins 自己, watchFolders 不含邻居项目
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;

const config = {
  resolver: {
    // 关键: 不让 Metro 解析 .expo 路径(隔壁 expo 项目残留)
    blockList: [
      /\/Users\/vincent\/work\/products\/.*\/node_modules\/.*/,
    ],
  },
  watchFolders: [
    path.resolve(projectRoot, 'node_modules'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);