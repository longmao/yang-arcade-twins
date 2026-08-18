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
    // 只屏蔽隔壁 expo 项目(yang-buhuo-daily),绝不能匹配自己的 node_modules
    // 旧正则 /products/.*/node_modules/.* 误伤了自己,导致 @babel/runtime 等全部 resolve 失败
    blockList: [
      /\/Users\/vincent\/work\/products\/yang-buhuo-daily\/.*/,
    ],
  },
  watchFolders: [
    path.resolve(projectRoot, 'node_modules'),
  ],
};

module.exports = mergeConfig(getDefaultConfig(projectRoot), config);