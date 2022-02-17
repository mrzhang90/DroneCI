---
title: 17 - CSR SSR双模式渲染支持以及其他细节梳理
date: 2020-06-18 15:25:11
permalink: /pages/88ad3b/
categories:
  - React SSR 服务端渲染原理解析与同构实践
tags:
  - 
---
## 导读

本节标题：CSR/SSR双模式渲染支持以及其他细节梳理

本节主旨：前面没有关注小细节，这里合并起来统一说明，如双模式渲染、跨平台处理、前端模块 hack、跨端访问等

# 正文

本节主要是补充一下以前没有提到的一些细节和一些问题以及解决思路，以便于我们可以更方便的应用本骨架进行业务开发，减少前期的一些时间准备成本。

本来打算将`csr/ssr`双模式渲染作为独立章节来说，但是具体的实现很简单，作为独立章节的话又确实没必要。

但是这个特性又非常重要，所以干脆将内容进行压缩一下，只说主要的部分，同时将本骨架的其他的一些细节合在一起介绍吧。

# ssr/csr 两种渲染模式支持

目前我们的骨架只是单纯的支持了`ssr`模式下的开发和运行，其实我们还可以做一个扩展，多加一个运行模式`csr`模式，这样整个应用就可以支持两种渲染模式。

我们可以根据需要来进行切换渲染模式，当应用的负载过大的时候我们也可以方便的切换为单页应用，这种临时处理方案可以迅速的降低服务器的压力。

## 实现说明

具体的实现很简单，我们在全局配置文件内增加一个配置，用于表示渲染模式。

我们目前是`ssr`模式，如果当前是`csr` 模式的话只需要返回一个空的`html`结构,然后向浏览器注入一个全局变量，表示当前的渲染模式。

其他的`css/js`资源正常按照`ssr`下的模式直出即可。

`增加一个全局设置`

```
// ./src/share/pro-config.js
//双端公用的配置文件

module.exports = {
    __IS_SSR__:false,//是否为 ssr 模式
    wdsPort:9002,//wds 服务的运行端口
    nodeServerPort:9001,//node server 的监听端口
    asyncComponentKey:'__IS_ASYNC_COMP_FLAG__'//标志组件是否是按需加载 turn | false
}

```

`服务端模式判断`

我们在`ssr`中间件对渲染模式进行判断，如果是`csr`则返回一个空的页面骨架。

```
let html="";//组件渲染结果
 if (proConfig.__IS_SSR__){
 //匹配路由
 //数据预取
 //组件渲染
 }

//...

    ctx.body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${tdk.title}</title>
    <meta name="keywords" content="${tdk.keywords}" />
    <meta name="description" content="${tdk.description}" />
     ${assetsMap.css.join('')}
</head>
<body>
    <div id="root">
       ${html}
    </div>
    <textarea id="ssrTextInitData" style="display:none;">
    ${JSON.stringify(fetchResult)}
    </textarea>
</body>
</html>
</body>
<script>
//注入全局渲染模式
window.__IS__SSR__=${proConfig.__IS_SSR__};
</script>
 ${assetsMap.js.join('')}
`;


```

`高阶组件调整`

我们的高阶组件`PageContainer`用来管理客户端页面在路由切换时是否进行异步获取数据，所以当前若是`csr`模式，则每次在`componentDidMount`内直接获取数据,也不需要监听`popstate`事件了。

```
// src/client/common/components/page-container/index.js

//...

async componentDidMount() {
            
            _this = this; // 修正_this指向，保证_this指向当前渲染的页面组件
            //只有当前是ssr模式才会注册事件，用于在页面切换时候触发
            window.__IS__SSR && window.addEventListener('popstate', popStateCallback);

            const canClientFetch = this.props.history && this.props.history.action === 'PUSH';//路由跳转的时候可以异步请求数据

            if (canClientFetch || !window.__IS__SSR) {//如果是 csr 模式，每次都需要异步请求数据
                await this.getInitialProps();
            }
        }


//...


```

完整代码：[https://github.com/Bigerfe/koa-react-ssr/blob/better/packages/my-react-ssr-dataisobetter/src/client/common/components/page-container/index.js](https://github.com/Bigerfe/koa-react-ssr/blob/better/packages/my-react-ssr-dataisobetter/src/client/common/components/page-container/index.js)

`看下整体的页面输出结果`

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>默认标题 - my react ssr</title>
    <meta name="keywords" content="默认关键词" />
    <meta name="description" content="默认描述" />
     <link rel="stylesheet" type="text/css" href="//localhost:9002/styles.css" />
</head>
<body>
    <div id="root">
       
    </div>
    <textarea id="ssrTextInitData" style="display:none;">
    {}
    </textarea>
</body>
</html>
</body>
<script>
//定义当前的渲染模式
window.__IS__SSR__=false;
</script>
 <script type="text/javascript"  src="//localhost:9002/libs.js"></script><script type="text/javascript"  src="//localhost:9002/main.js"></script><script type="text/javascript"  src="//localhost:9002/styles.js"></script>


```

`模式热切换`

我们现在是将渲染模式放到了配置文件内，手动切换模式后需要重启`node`进程，如果想做到动态切换可以将配置值从接口来获取,这样不需要重启 `node`服务。

ok，到这里双模式支持完成。

# 跨平台设置环境变量

在使用`npm scripts`运行本骨架时会设置环境变量，目前只能在`mac`系统运行正常，`windows`下运行会报错。

所以需要使用`cross-env`来进行环境变量的设置，该库能够以`unix`方式设置环境变量，然后在`windows`上也能兼容运行。

改造后的命令为

```
"scripts": {
    //...
    "build": "cross-env NODE_ENV=production npm run client:build && npm run server:build",
    "client:build": "cross-env NODE_ENV=production webpack --config  ./webpack/webpack.prod.config.js",
    "server:build": "cross-env NODE_ENV=production webpack --config  ./webpack/webpack.server.config.js",
    //...
    "wds:watch": "cross-env BABEL_ENV=development node ./webpack/scripts/wds-start.js"
  },

```

# 前端模块 hack

`react ssr`开发骨架的核心是`同构`,也就是双端会运行同一套代码，所以一些用于浏览器端的模块就会在服务器端执行，然而此时就会报错。

因为`document window`都是浏览器的对象，`node`里不存在。

那我们应该解决这个问题呢？

## 最直接的方式

直接在`node global`上增加相关缺失的属性

```
global.document={};
global.window={};

```

这种方式虽然可行，但是比较辛苦。如果是多级访问的对象可就更麻烦了。

```
document.location.hash
document.location.hash={};

```

所以这个方式并不好，放弃吧。

## 使用babel插件

最彻底的办法是不让服务端加载浏览器模块，所以我们可以写一个插件，在代码打包的时候将导入的模块替换为`{}`。

和我们前面小节中过滤掉组件内的 `css`模块的方式一致。

这个方式在我这个开发骨架`1.0`版本的时候使用过。

所以最终运行在服务端代码会变为

```
import React from 'react';

- import dom from './dom';

+ const xxMd = {};


```

这个方式可以彻底解决，但是实现有些复杂了。其实还有更简单的方式，往下看。

既然不是最好的，就不做过多介绍了。

## 使用动态加载

使用我们在`webpack`内定义的全局变量`__SERVER__`,结合使用`require`运行时执行来实现。

这样服务端就彻底不会加载这个前端模块了。

```
//当前环境是服务端 则 dom={} 
const dom = __SERVER__ ? {} : require('./dom').default;


```

`测试模块`

```
// dom.js 

console.log(window.location.href);

export default {
    log(){
        console.log(window.location.href);
    }
}


```

# 无法跨端访问

目前本骨架在本地开发服务为双服务模式，一个是`node server`绑定的是`9001`端口，另一个是静态资源`webpack-dev-server`启动的服务绑定端口为`9002`，而骨架内的静态资源`host`地址为`localhost`，所以只能在本地访问，无法在其他设备或者终端访问。

## 改造思路 1

通过本机`ip`启动`node server`,同时其静态资源地址统一为`ip`地址即可。

`获取本机ip`

```
const os = require('os');

function getNetworkAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            const { address, family, internal } = interface;
            if (family === 'IPv4' && !internal) {
                return address;
            }
        }
    }
}


```

然后调整`wds`和`webpack.dev.config`的相关配置

```
// webpack-dev-server.config

  output: {
        filename: '[name].js',
        path: resolvePath('../dist/static'),
        //设置静态资源地址通过 ip 访问
        publicPath: `http://${__LOCAL_IP__}:${proConfig.wdsPort}/`
    },


```

设置`wds`选项的`host`为本机 `ip`

```
// ./webpack/webpack-dev-server.config
module.exports = function (port, publicPath) {
    return {
        host: global.__LOCAL_IP__//本机 ip，这里我提前把 ip 作为一个全局变量
    //...
    }

```

## 改造方案 2

使用`node server` 进行请求转发。

```
module.exports = {
  proxy: {
    host: 'http://127.0.0.1:9002', // 本地开发时,代理前端打包出来的静态资源
    match: /(\/static)|(\/sockjs-node)|(\/__webpack_dev_server__)|hot-update/
  }
}

```

# 子进程的平台兼容问题

我们本地开发时执行`npm run dev`命令，内部会创建多个子进程。

```
const {spawn} = require('child_process');//用于创建子进程

//wds 服务
const feCodeWatchProcess = spawn('npm', ['run', 'wds:watch',localHostIp], { stdio: 'inherit' });

//服务端代码监控和编译进程
const svrCodeWatchProcess = spawn('npm', ['run', 'svr:watch']);

//....


```

但上面`spawn`使用方式在`windows`系统上会报错。

原因：当执行 `npm` 时，实际执行的是 `npm.cmd` 批处理，而在`windows`上，`.cmd`, `.bat` 批处理是无法脱离 `cmd.exe`解释器而单独运行的。

## 解决方法1

调用 `spawn` 函数时，设置 `shell` 选项为 `true` 以隐式地调用 `cmd`。

```
spawn('npm', {
  stdio: 'inherit',
  shell: true
});

```

优化一下,毕竟在`mac`上不需要此设置

```
const child = cp.spawn('npm', ['run', 'build'], { shell: process.platform === 'win32' });

```

## 解决方法 2

除了自己编写代码的时候做处理，也有第三方模块`cross-spawn`。

使用该模块，可以在调用 `spawn` 函数时，自动根据当前的运行平台，来决定是否生成一个 `shell` 来执行所给的命令。

```
npm install cross-spawn

const spawn = require('cross-spawn');
 
spawn('npm', {
  stdio: 'inherit'
});


```

# 数据预取方法参数

在前面小节内，我们的数据预取都是获取的假数据，所以没有提关于一些动态参数的传递问题。但在实际业务中是离不开的。

```
//还没有传递参数
Index.getInitialProps= async ()=>{
    console.log('fetch data index');
    //模拟数据请求方法
    //...

    return {
        page: {
            tdk: {
                title: '首页 - koa-react-ssr',
                keywords: '关键词 - koa-react-ssr',
                description: '描述'
            }
        }
    };
}

```

所以这里单独说明下需要传递的参数。

最基本的参数有路由`params`和`url query`。

`路由params`

```
    {
        path: '/list/:id',//id 的获取
        component:A,
        exact: true
    },

```

`url`透传的参数

```
//获取 a b 值
http://localhost:9001/list/100?a=1&b=2

```

## 约定参数

我们可以约定函数的参数如下

```
Index.getInitialProps= async ({match,location})=>{
    //...
}

```

## 客户端处理

上面两个参数可以在组件的`props`属性获取。

```
var match = this.props.match;
var location = this.props.location;

```

所以只需要在调用的时候带入`props`即可。

```
 //用于封装处理
 async getInitialProps(){
            //ssr首次进入页面以及csr/ssr切换路由时才调用组件的getInitialProps方法
            const {match,location} = this.props;
            const res =  SourceComponent.getInitialProps ? await SourceComponent.getInitialProps({match,location}) : {};
            //...
        }

```

## 服务端处理

在服务端调用数据预取方法时，路由的匹配结果会返回`match`结果，结果内包含了`params`。

```
 //查找到的目标路由对象
    let matchResult = await matchRoute(path, staticRoutesList);
    //targetMatch 包含参数信息
    let { targetRoute, targetMatch } = matchResult;
    
//...targetMatch 
{ path: '/list', url: '/list', isExact: true, params: {} }

```

另外`location`就可以通过`ndoe server context`来获取了,具体代码就省略了。

除了这两个基础参数外，可能还需要对服务端做一些单独的处理，所以我们可以带入`req`，`res`对象。

```
Index.getInitialProps= async ({match,location,req,res})=>{
    if(req){
        //服务端处理
    }
}

```

# 页面级渲染可控

这里只是提一个想法，在我们的项目中存在很多页面，可能有些页面根本不需要考虑`SEO`,所以也就不需要`ssr`。

所以我们需要做到对页面级的渲染模式可控。

可以约定为组件添加一个静态属性，该属性表示当前页面是否开启`ssr`渲染。

```
class Index{
    
}

Index.__OPEN_SSR__=false;//关闭 ssr

```

然后在服务端匹配路由时，就可以通过对该属性进行逻辑判断当前页面是否需要做`ssr`。

# 配套 cli 工具

一个完整的开发框架一般都会配`cli`脚手架工具，可以在命令行下帮我们快速的创建项目开发模板。

像`react`的`create-react-app`，`vue`的`vue-cli`。

本骨架的`cli`工具目前已经开发完成，具体的实现方式很简单,所以就不做具体介绍了。

`cli`项目源码： [https://github.com/Bigerfe/zzjs-cli](https://github.com/Bigerfe/zzjs-cli)

另外具体的实现可以参考下面文章，写的很不错

[https://mp.weixin.qq.com/s/CO6La0NCHnsfXN4MHgiBag](https://mp.weixin.qq.com/s/CO6La0NCHnsfXN4MHgiBag)

# 小结

本小节主要是总结性的说明下之前我们没有涉及到细节，包括一些问题和扩展方案。

这些应该算是比较基础的，也比较容易发现的，其实还有很多可以扩展的地方。比如路由配置，现在是集中配置，其实这种方式并不利于维护，或许我们可以参考`next.js`的约定式路由来改造一下。

其他更多的扩展，可能需要在后期的使用中逐步的挖掘和完善，好在，这个骨架是白盒的，你可以灵活定制。

感谢你的阅读。

如果有问题欢迎留言，也欢迎在留言区留下你的想法和思考。