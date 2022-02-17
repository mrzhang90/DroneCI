---
title: 10 - 「建造毛坯」-  CSS  资源处理
date: 2020-06-18 15:25:11
permalink: /pages/784269/
categories:
  - React SSR 服务端渲染原理解析与同构实践
tags:
  - 
---
## 导读

本节标题：「建造毛坯」- CSS 资源处理

本节主旨：CSS 模块无法在服务端解析，通用的 CSS 资源处理方式

本节配套代码：

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-css](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-css)

# 正文

从我们开始搭建应用骨架到这里，这一路我们发现了很多问题，也解决了很多问题,这个收获是巨大的。但总感觉少点什么，期间完全没有涉及到 `css` ，一个完整的项目怎么能缺少 `css` 呢？

所以本节开始，我们来把 `css` 融合到我们的应用骨架里，达到可以给组件添加样式，美化页面的目的。

不就是支持 `css` 嘛，配置几个 `loader` 就完事了。

真的这么简单吗？

接下来，我们一步一步的实现应用骨架对 `css` 的支持。

# 安装所需 loader

```
npm i sass-loader style-loader postcss-loader css-loader autoprefixer

```

使用`sass`预编译，使用`postcss-loader + autoprefixer` 为选择器增加浏览器前缀

# 浏览器端 - loader 配置

加入 `css` 的相关`loader`配置，开发环境中使`css`打包进 `js`，`style-loader`会帮助我们将 `css`内联在页面内。

```
// webpack/webpack.dev.config.js
//webpack 配置文件
const path = require('path')
const resolvePath = (pathstr) => path.resolve(__dirname, pathstr);

module.exports = {
    mode: 'development',
    entry: resolvePath('../src/client/app/index.js'),//入口文件
    output: {
        filename: 'index.js',
        path: resolvePath('../dist/static')
    },
    module: {
        rules: [{
                test: /\.jsx?$/,
                loader: 'babel-loader',
                exclude: /node_modules/
            },
            {
                + test: /\.(sa|sc|c)ss$/,
                + use: [
                    {
                        loader: "css-loader",
                    },
                    {
                        loader: "postcss-loader"
                    },
                    {
                        loader: "sass-loader"
                    }
            },
                {
                        test: /\.(png|jpg|gif)$/,
                        use: [{
                            loader: 'file-loader',
                            options: {
                                name: 'img/[name].[ext]'//配置图片的输出路径和名称
                            }
                }]
            ]
            },
        ]
    }
}


```

配置`autoprefixer`完成 `css` 前缀转换

在项目根目录创建`postcss.config.js`文件进行配置,也可以直接和 `loader` 写在一起，看个人习惯。

```
module.exports = {
    plugins: [require('autoprefixer')]  // 引用该插件
}

```

上面我们就完成了，针对浏览器端的 `css` 配置。

# 添加css测试代码

给`layout`组件添加`css`，作为全局样式

```
// ./src/client/app/layout.css

body {
  background-color: #f4f5f5;
}

.layout-box {
  max-width: 750px;
  margin: 0 auto;
  text-align: center;
  background: #fff;
}

.layout-box h1 {
  margin-top: 20px;
  margin-top: 20px;
}


```

给`index`组件添加`css`，作为业务`css`

```
// ./src/client/pages/index/index.scss

.page-index-box{
    width: 750px;
}


```

`Index`组件导入 `css`

```
// ./src/client/pages/index/index.js
//....
import './index.scss';
//....

```

结果运行`npm run dev`时，服务端代码打包失败。

![](https://user-gold-cdn.xitu.io/2020/1/31/16ffb3d6c0b6526e?w=958&h=414&f=png&s=192108)

由于组件会在双端构建，我们在组件内导入了 `css`，而服务端`webpack`配置文件没有配置相关的 `css loader`，所以服务端的代码打包失败了。

# 服务端处理

*   暴力破解法

既然服务端无法处理`css`模块，而我们也不能给服务端配置添加相关的 `css loader`,否则`css`也会被打包进`js`。

所以需要采取其他方法，这里有个取巧的方式，我们可以在服务端代码构建前干掉这行代码。

*   如何删除这行导入？

方法有很多种，要么是借助工具，要么是自己写插件。

在这里我们自定义一个 `babel plugin` 来搞定。

*   如何写 `babel plugin`

我们先增加一个目录，`babel` 下存放 `plugin` 和 `preset`。

![](https://user-gold-cdn.xitu.io/2019/12/13/16efece40a402185?w=293&h=368&f=png&s=29662)

创建一个 `js` 文件为插件文件,插件的名称为`no-require-css`

```
// ./webpack/babel/plugin/no-require-css.js

/**
 * 删除代码中导入的 css
 */
module.exports = function ({ types: babelTypes }) {
    return {
        name: "no-require-css",
        visitor: {
            ImportDeclaration(path, state) {
                let importFile = path.node.source.value;
                if(importFile.indexOf('.scss')>-1){
                    //如果引入了 css文件，则删除此节点
                    path.remove();
                }
            }
        }
    };
};


```

*   配置插件

在`.babelrc`内配置这个插件

```
{
    "env": {
        "node":{
            "presets": [
                [
                    "@babel/preset-env",
                    {
                        "targets":{
                            "node":"current"
                        }
                    }
                ],
                "@babel/preset-react"
            ],
            "plugins": [
                "@babel/plugin-proposal-class-properties",
                + "./webpack/babel/plugin/no-require-css"          
            ]
        }

```

*   查看结果

服务可以正常启动，`css` 已经内联到了`head` 内。

![](https://user-gold-cdn.xitu.io/2020/1/3/16f69eb1b59b25eb?w=1005&h=452&f=png&s=140778)

# 页面抖动问题

我们已经实现了`css`的渲染，但是有些勉强，效果不够好，当页面刷新或者第一次进入的时候，页面会抖动。

![](https://user-gold-cdn.xitu.io/2020/1/3/16f6a444388fd625?w=868&h=375&f=png&s=36586)

![](https://user-gold-cdn.xitu.io/2020/1/3/16f6a44fa483c564?w=868&h=375&f=png&s=38548)

因为第一次进入是服务端直出的 `html` 结构，没有 `css` 。

`css` 是在客户端`js` 代码执行后动态插入到 `head` 内的，所以会出现抖动。

*   如何解决这个问题呢？

我们可以采用传统的方式来解决，将所有的`css`模块 打包成一个文件，然后在服务端直出的时候带上它，作为资源文件加载。

例如:

```
<link rel="stylesheet" type="text/css" href="//s1.bigerfe.com/zz-static/css/styles.04403cf0.css">


```

*   具体如何实现？

可能你会说，我们这里路过来问题有点太多了吧，这一个接一个的。

不用怕，慢慢来，不怕问题多，就怕没问题。

来吧，一起搞定他！

# css 合并

在`webpack4`里需要使用`mini-css-extract-plugin`插件来将 `css` 进行合并。

看下具体配置

将`style-loader`替换为

```
//...
  {
    loader: MiniCssExtractPlugin.loader,
  }
//...

```

设置`plugin`

```
  //...
  plugins: [
        new MiniCssExtractPlugin({
        filename: '[name].css' //设置名称
    })]

```

上面的`[name]`为资源的名称，会使用当前配置的`entry`的名称，所以我们调整下`entry`定义,增加入口`main`

```
//...
 entry:{
        main: resolvePath('../src/client/app/index.js'), //入口文件
    }
//...

```

同时将`js`的 `bundle` 的名称改为占位

```
  output: {
        filename: '[name].js',
        path: resolvePath('../dist/static')
    }

```

## 服务端调整

经过上面的配置，我们已经将所有的 `css`打包到一个文件内。

![](https://user-gold-cdn.xitu.io/2020/1/3/16f6a4c2f4a00ef5?w=269&h=168&f=png&s=11221)

在服务端只需将`main.css`作为 `link` 直出即可。

```
// ./src/server/middlewares/react-ssr.js

//...
    ctx.body=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${tdk.title}</title>
    <meta name="keywords" content="${tdk.keywords}" />
    <meta name="description" content="${tdk.description}" />
    + <link rel="stylesheet" type="text/css" href="/main.css" />
</head>

//...


```

启动服务，页面已正常显示。

看下具体效果

![](https://user-gold-cdn.xitu.io/2020/1/3/16f6a4eeffa49502?w=500&h=375&f=png&s=92471)

![](https://user-gold-cdn.xitu.io/2020/1/3/16f6a4feb128f170?w=500&h=375&f=png&s=39298)

# 小结

本节我们主要实现`react ssr`中的 `css` 的支持和处理。

客户端的处理，配置和我们以往单页开发中的配置没什么区别，主要是服务端方面的处理。

我们采用的方式比较直接，服务端构建前将导入的`css`模块代码移除，然后客户端配置将 `css` 提取到一个文件内，然后将 `css`作为`link`直出到浏览器端，解决了页面的抖动问题。

本节代码已上传

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-css](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-css)

感谢你的阅读。

如果有问题欢迎留言，也欢迎在留言区留下你的想法和思考。