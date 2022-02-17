---
title: 15 - 「装修阶段」- CSS 资源同构直出
date: 2020-06-18 15:25:11
permalink: /pages/3a72b0/
categories:
  - React SSR 服务端渲染原理解析与同构实践
tags:
  - 
---
## 导读

本节标题：「装修阶段」- CSS 资源同构处理

本节主旨：利用同构，实现 CSS 资源按需直出，提升 CSS 资源的加载速度，提升页面性能

本节配套代码：

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-cssiso](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-cssiso)

# 正文

之前的小节中我们已经对 `css`做过处理，将所有的`css`打包到一个文件内,然后作为资源`link`和组件的 `html`内容一起直出到客户端。

![](https://user-gold-cdn.xitu.io/2020/1/8/16f842f0a71e223d?w=891&h=178&f=png&s=49649)

# 发现问题

上面的方式很简单也很有效。

但存在一些问题，当项目体量上来后`css`代码量剧增，导致最终打包的`css`文件会过大，另外只要一个页面的`css`内容产生变化，就会导致此文件的缓存生效，用户端就需要重新下载，最终会对体验和性能造成影响。

# 优化思路

如何来解决这个问题呢？

前面的小节中我们对`js` 业务代码进行了优化，使用了路由拆分，按需加载,只加载基础库和当前页面的代码，大大缩减了所需下载的资源体积。

所以我们也可以使用`按需加载`的方式对该问题进行优化处理。

# 实现分析

如何实现呢？

相信大家都用过`style-loader`，该库的作用是将模块引入的 `css`，在客户端渲染的时候以内联的形式动态插入到`head`内。

![](https://user-gold-cdn.xitu.io/2020/1/8/16f843f48bca87f5?w=444&h=577&f=png&s=68879)

上图便是我们在单页应用开发中的必然产物。

那么插入到`DOM`时的`css`内容从哪里获得的呢?

这里就需要说到`css-loader`了，它的存在是很强大的，`js`模块内导入的`css`文件能够被处理，全仰仗该库的作用。

该库会把`css`代码转换成`js`代码或者`css`字符串，最终和`js`模块代码打包在一起，之后便能够作为`js`代码的一部分加载到客户端，然后`style-loader`便会简单粗暴的使用`DOM`操作将`css`中的样式插入`head`内。

那上面这些内容和我们的 `css`按需加载有什么关系呢？

我们可以得到一些信息，`css-loader`可以让我们得到导入的`css`文件的内容，如果我们得到了这些信息就可以在服务端直出组件的时候将`css`代码一同直出。

当客户端接管页面后，后续的访问就是单页应用了，此时`css`就应该是由客户端代码动态插入到`head`标签内。

但是上面介绍的`style-loader`就无法胜任了，它只能运行在客户端，在服务端就无法愉快的玩耍了。

所以我们要使用一种同构的方式来处理，让双端都可以运行。

# isomorphic-style-loader

该库没有像`style-loader`那样直接进行`DOM`操作，而是导出了一些辅助方法，让用户依据实际情况来调用不同的方法。

可以参考下面部分源码来理解下

```
//用于获得模块信息和 样式内容
exports._getContent = function() { return content; };
//获得 css 内容
exports._getCss = function() { return '' + css; };
//执行 dom 操作，将 css 动态插入到head 内
exports._insertCss = function(options) { return insertCss(content, options) };


```

可以先看下官方的说明,里面也包含了很多参考实例

[https://github.com/kriasoft/isomorphic-style-loader](https://github.com/kriasoft/isomorphic-style-loader)

# 具体实现

现在我们已经了解了`css`同构直出的原理，接下来进行一步一步的实现。

## 从开发环境开始，首先调整 webpack 配置

之前我们是使用插件`mini-css-extract-plugin`将`css`全部提取到一个文件内，现在这个插件就不需要使用了，替换为下面的配置。

`客户端配置`

```
// webpack/webpack.dev.config.js

//...
  {
                test: /\.(sa|sc|c)ss$/,
                use: ['isomorphic-style-loader',
                    {
                        loader: "css-loader",
                        options: {
                            importLoaders: 2
                        }
                    }, 'postcss-loader', 'sass-loader'
                ]
            }
//...

```

`服务端配置`

同时服务端`webpack.server.config.js`的配置和上面客户端的配置保持一致即可。

## 页面组件的调整

```
// ./src/client/pages/index/index.js

//导入 css
import css from  './index.scss';
//导入高阶组件，用于同构处理 css
import withStyles from 'isomorphic-style-loader/withStyles'

//组件代码 略...


export default withStyles(css)(PageContainer(Index));



```

## 客户端渲染入口的调整

```
//定义css处理逻辑，实现将 css 动态插入到`head`内

  const insertCss = (...styles) => {
                const removeCss = styles.map(style => style._insertCss());//客户端执行，插入style
                return () => removeCss.forEach(dispose => dispose());//组件卸载时 移除当前的 style 标签
        }


//导入内置的 context 组件，用于将上面的方法传递给子组件
import StyleContext from 'isomorphic-style-loader/StyleContext';
    
ReactDom.hydrate(<BrowserRouter>
    <StyleContext.Provider value={{ insertCss }}>
        <App routeList={routeList}/>
    </StyleContext.Provider>

</BrowserRouter>,document.getElementById('root'))；
//...

```

## 服务端 `ssr` 中间件调整

基本上和客户端的渲染部分差不多，只是服务端只需要收集到所有组件的`css`样式内容。

```
//定义存储组件 css 的变量
const css = new Set() // CSS for all rendered React components

//定义收集 css 的方法.此方法会在`withStyles`高阶组件内获得，然后执行该方法，完成 css 内容搜集。
const insertCss = (...styles) => styles.forEach(style => css.add(style._getContent()));

const html = renderToString(<StaticRouter location={path} context={context}>
<StyleContext.Provider value={{ insertCss }} >
    <App routeList={staticRoutesList}></App></StyleContext.Provider>
</StaticRouter>);

//...


```

## 配置基本完成，但存在问题

我们先来看下效果。

本地启动服务并运行，查看网页源代码的确能看到`css`直出到了页面。

![](https://user-gold-cdn.xitu.io/2020/1/8/16f85df30392c227?w=1466&h=818&f=png&s=206441)

但是通过审查元素会发现问题，客户端也执行了插入，相当于是两份相同的 `css`。

![](https://user-gold-cdn.xitu.io/2020/1/8/16f85e20cb580434?w=1894&h=1176&f=png&s=603469)

正常情况下应该是服务端直出了`css`内容，客户端在插入前需要判断是否可以插入。

`根据什么来判断呢？`

![](https://user-gold-cdn.xitu.io/2020/1/9/16f85e415b62c26e?w=1114&h=624&f=png&s=216712)

上面截图中能看到`style`标签上都有`id`的属性，所以关键就在这里，猜想肯定是通过`id`来判断。

```
//执行 dom 操作，将 css 动态插入到head 内
exports._insertCss = function(options) { return insertCss(content, options) };

```

`_insertCss`方法的内部逻辑也是通过 `id`来判断的。

下面是关键代码，一看便知。

```
// https://github.com/kriasoft/isomorphic-style-loader/blob/master/src/insertCss.js
//...

//根据 id 获取对应的节点
 let elem = document.getElementById(id)
    let create = false

    if (!elem) {//如果节点不存在 才会执行插入
      create = true

      elem = document.createElement('style')
      elem.setAttribute('type', 'text/css')
      elem.id = id

      if (media) {
        elem.setAttribute('media', media)
      }
    }

//...

```

`如何给 style 标签 增加 id呢？`

`id 的取值又是什么,又如何取值呢？`

其实`isomorphic-style-loader`已为我们提供，只是有时候需要多尝试下。

```
//用于获得模块信息 和 样式内容
exports._getContent = function() { return content; };

```

该方法会返回当前 `css`模块的`id`和样式信息。

在上面几张图中能看到`id`的取值是很长的字符串。之所以这么长，是因为在`development`环境中`id`值默认为模块的相对路径地址。

## 设置style标签 id

根据上面的分析，我们来对`react ssr`中间件做下调整。

```
    const css = new Set() ;
    - React components
    const insertCss = (...styles) => styles.forEach(style => css.add(style.——getCss()));
    
    + React components
    const insertCss = (...styles) => styles.forEach(style => css.add(style._getContent()));//该方法会获得css id 值


```

增加转换逻辑，在直出时可以带上`style`标签和`id`属性。

```
    const styles = [];
    [...css].forEach(item => {
        let [mid, content] = item[0];
        styles.push(`<style id="s${mid}-0">${content}</style>`)
    });
    //...

```

直出部分

```
<head>
    <meta charset="UTF-8">
    <title>${tdk.title}</title>
    <meta name="keywords" content="${tdk.keywords}" />
    <meta name="description" content="${tdk.description}" />
    ${styles.join('')}
</head>

```

# 生产环境处理

经过上一步的处理，目前已经不会重复插入`style`了。

![](https://user-gold-cdn.xitu.io/2020/1/9/16f85f2a24505ea7?w=1094&h=496&f=png&s=192551)

开发环境是 ok 了，不过生产环境中，仍然有坑。

继续往下看。

生产环境也主要是调整下`webpack.prod.config.js`配置，移除`mini-css-extract-plugin`的使用，调整 下`scss`相关`loader`配置即可。

```
   {
        test: /\.(sa|sc|c)ss$/,
        use: ['isomorphic-style-loader',
                {
                    loader: "css-loader",
                    options: {
                            importLoaders: 2
                        }
                }, 'postcss-loader', 'sass-loader'
            ]
    }

```

构建后，并启动生产环境服务。

![](https://user-gold-cdn.xitu.io/2020/1/9/16f85f9cc7d545bf?w=2220&h=446&f=png&s=215831)

从上图中可以看出，在生产环境`style`标签的`id`不再是模块的相对路径，而变成了数字，比如`s19-0`。

其中的`s`为前缀，后面的`-0`其实没用，永远都是`-0`，源码中本身可以删除这个逻辑。

问题出现了，当我们审查元素的时候发现`style`标签增多了，又出现了重复的插入，客户端排重失败。

![](https://user-gold-cdn.xitu.io/2020/1/9/16f85fe063783640?w=1894&h=672&f=png&s=247803)

原因是：客户端的模块 `id`和服务器的模块`id`值不同。

为什么不同呢 ？

因为环境问题，打包的目标平台不同，所以`node`和`浏览器`的打包内容也不同，所以就会导致模块的`id`值不同。

诶？可是在开发环境采用的是模块的路径是相同的，这个是肯定的。

### HashedModuleIdsPlugin 解决模块 id 不稳定问题

该插件会根据模块的相对路径生成一个四位数的`hash`作为模块`id`, 主要用于生产环境。

ps:服务端打包配置也需要配置此插件

```
new webpack.HashedModuleIdsPlugin({
  // Options...
})

```

ok，直接上插件。

```
// ./webpack/webpack.prod.config.js

  plugins: [
        new webpack.HashedModuleIdsPlugin(),
    //...
    ]


```

重新启动服务后，得到了我们期望的结果。

![](https://user-gold-cdn.xitu.io/2020/1/9/16f860762a797dd4?w=2108&h=440&f=png&s=204836)

![](https://user-gold-cdn.xitu.io/2020/1/9/16f8607fa336a71e?w=1406&h=438&f=png&s=177235)

## 但是最后还有个 bug

这个问题很难发现，隐藏的比较深。

我在验证的过程中发现了`style`标签内容会被替换，经过一番折腾验证了这个问题。

然后经过研究和排查，最终确定这该同构库的一个 `bug`。

`insertCss.js 文件`

![](https://user-gold-cdn.xitu.io/2020/1/9/16f860c3ee2817ec?w=1464&h=1406&f=png&s=255043)

以上代码中，`id`排重验证没有问题，到后面，也就是我标注的地方，判断是有问题的。

但我没理解为什么加这个判断，干掉以后就正常了。

所以也顺便给官方提了一个 [pr](https://github.com/kriasoft/isomorphic-style-loader/pull/176)。

# 小结

本节我们再次对`css`代码进行了一次优化，采用的是同构直出的方式实现了`css`的按需加载，减少了请求次数，解决了单一文件的弊端。

另外也大致的了解了`style-loader`,`css-loader`以及`isomorphic-style-loader`的原理。

本节完整代码已上传

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-cssiso](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-cssiso)

感谢你的阅读。

如果有问题欢迎留言，也欢迎在留言区留下你的想法和思考。