const themeConfig = require('./config/themeConfig.js');
module.exports = {
  // theme: 'vdoing', // 使用npm包主题
  theme: require.resolve('../../theme-vdoing'), // 使用本地主题
  title: '张广森的博客',
  description: '记录技术提升的点点滴滴',
  themeConfig,
};
