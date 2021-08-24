const path = require('path');
const shell = require('shelljs');
const colors = require('colors');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
// 处理命令行输入的参数
const argv = yargs(hideBin(process.argv)).argv;
// 增量文件
const Rsync = require('rsync');

// 参数
const [targetName] = argv._;
// 服务器群
const home_map = {
  test01: 'root@01-test:/doc',
};
if (!home_map[targetName]) {
  shell.echo(colors.red('🐈  目标主机不存在，是不是写错了呀'));
  shell.exit(1);
}

// 安装依赖
console.log(colors.yellow('🚴 安装依赖')); // outputs green text
if (shell.exec('npm i').code !== 0) {
  shell.echo('Error: npm i failed');
  shell.exit(1);
}

// 测试
console.log(colors.yellow('🚗 开始测试')); // outputs green text
if (shell.exec('npm run test').code !== 0) {
  shell.echo('Error: npm run test failed');
  shell.exit(1);
}

// 构建
console.log(colors.yellow('🚚  开始构建')); // outputs green text
if (shell.exec('npm run docs:build').code !== 0) {
  shell.echo('Error: npm run docs:build failed');
  shell.exit(1);
}

// 部署
console.log(colors.yellow('🚁  开始部署')); // outputs green text
const rsync = Rsync.build({
  source: path.join(__dirname, '../', './docs/.vuepress/dist/*'),
  destination: home_map[targetName],
  flags: 'avz',
  shell: 'ssh',
});

rsync.execute(function (error, code, cmd) {
  // we're done
  console.log(error, code, cmd);
  console.log(colors.blue('🚘  部署完成')); // outputs green text
});
