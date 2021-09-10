const nav = require('./nav.js');
// 主题配置
module.exports = {
  nav,
  search: false,
  // sidebar: [
  //   ['/', '主页'],
  //   ['/droneCI/', 'CD实战 droneCI'],
  // ],
  footer: {
    // 页脚信息
    copyrightInfo: '', // 博客版权信息，支持a标签
    icp: `
      <a href="http://www.beian.gov.cn/portal/recordQuery?token=a56c28fc-2043-4785-97d4-ab0144a8cd1a"><img src="http://www.beian.gov.cn/img/new/gongan.png"/>京公网安备 11011202002888号</a>  <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">京ICP备2021027793号</a>   
    `, // 备案信息，支持a标签
  },
};
