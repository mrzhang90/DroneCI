---
title: 9 - 「建造毛坯」- SEO TDK 支持
date: 2020-06-18 15:25:11
permalink: /pages/3834c9/
categories:
  - React SSR 服务端渲染原理解析与同构实践
tags:
  - 
---
## 导读

本节标题：「建造毛坯」- SEO TDK 支持

本节主旨：解决 SPA 的不足，两种方式实现 TDK 直出，达到 `SEO` 优化的目的

本节配套代码：

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-seo0](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-seo0)

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-seo1](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-seo1)

# 正文

这一节我们来解决一个小问题，在我们小册开篇的时候也着重提到过，那就网页的 `SEO`,主要是指页面的 `TDK`信息。

上一节我们已经让页面内有了数据，`SEO`优化除了需要基础数据外，`TDK`也是非常重要的,否则搜索引擎很难知道你这页面是干啥的。

`TDK`

*   title 当前页面的标题
*   description 当前页面的描述
*   keywords 当前页面的关键词

可以参考京东官网的 `tdk`

![](https://user-gold-cdn.xitu.io/2019/12/31/16f5ad71d42cf3fd?w=1317&h=195&f=png&s=93959)

另外也可以看下`弹个车`的 `tdk`，弹个车整站就是个单页应用，很早之前没有`tdk`,现在已经直出了`tdk`。

搜索引擎爬虫会抓取页面内容同时根据上面三个关键内容确定网页的内容和权重。

如何实现像上面这样的 `tdk` 信息直出效果呢？

我们已经实现了组件直出，增加`tdk` 直出是不是太简单了。

# 简单粗暴

在`react-srr`中间件里加入相关的 `meta` 标记

```
// /src/server/middlewares/react-ssr.js

***
ctx.body=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    + <title>my react ssr 标题</title>
    + <meta name="keywords" content="关键词内容" />
    + <meta name="description" content="描述内容" />
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
<script type="text/javascript"  src="/index.js"></script>
`;
***


```

以上代码便可以为所有的页面添加 `tdk` 信息，简单粗暴，但是意义不大。

一个网站有很多页面，每个页面的信息肯是不同的，所以我们需要动态的设置，让每个页面的 `tdk` 可以 不同。

# 动态 tdk - 数据预取中做手脚

可以从我们的数据预取方法返回当前页面的 `tdk` 信息 ，服务端得到数据后可直出到页面，同时浏览器端在`componentDidMount`生命周期内通过 `DOM` 操作 修改当前页面的`title`信息,来避免单页跳转时 `title` 不变的问题。

在数据预取中返回 `tdk`还有一个好处，就是可以在预取方法内利用当前的数据来组织 `tdk`,让每个页面的 `tdk` 不同。

```
***
 //数据预取方法
 static async  getInitialProps() {
        //模拟数据请求方法
        const fetchData=()=>{
            return new Promise(resolve=>{
                setTimeout(() => {
                    resolve({
                        code:0,
                        data: tempData
                    })
                }, 100);
            })
        }

        let res = await fetchData();
        
        — return res;
        + return {
            fetchData:res,
            page:
            {
                tdk:{
                    title:'首页',
                    keywords:'前端技术江湖',
                    description:'前端技术江湖'
                }
            }
        }
    }
***

```

## 组件内需要的处理

`componentDidMount`内通过 `DOM`操作 设置页面标题，防止页面切换的时候标题不更新。

```
 componentDidMount(){
        let {tdk} =this.state.page;
        if(tdk){
            document.title=tdk.title;
        }
        
         if(!this.state.fetchData){
            //如果没有数据，则进行数据请求
            Index.getInitialProps().then(res=>{
                this.setState({
                    fetchData:res.fetchData||[],
                    page:res.page
                });
                //重设页面 title
                document.title = res.page.tdk.title;
            })
        }
        
    }

```

## 服务端获取 tdk 信息

服务端代码调整,我们可以直接从数据预取的方法里得到页面的 `tdk` 信息，所以可以很方便的直出到页面内。

获取 `tdk` 信息

```
//  /src/server/middlewares/react-ssr.js

//...
 let { page } = fetchResult || {};
    let tdk = {
        title: '默认标题',
        keywords: '默认关键词',
        description: '默认描述'};

    if(page && page.tdk){
        tdk=page.tdk;
    }
//...

ctx.body=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    + <title>${tdk.title}</title>
    + <meta name="keywords" content="${tdk.keywords}" />
    + <meta name="description" content="${tdk.description}" />
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
<script type="text/javascript"  src="//localhost:9002/index.js"></script>
`;

//...

```

上面代码将 `tdk` 内容和 `html` 内容一同返回给浏览器。

![](https://user-gold-cdn.xitu.io/2019/12/18/16f16fc9425a579c?w=1324&h=320&f=png&s=87838)

# 动态 tdk - 使用轮子

此方法是方法1的改造，`tdk`数据 依然从`getInitialProps`方法内返回。

方法1的实现方式比较传统，虽然思路较容易理解，但是代码涉及的部分较多，有些繁琐，效率不高，且容易出错。

所以这里我们结合现有的轮子来完成这个功能，该用轮子用轮子，毕竟轮子可以帮助我们提高一些效率,而且功能更丰富。

## react-helmet 组件

该组件可以帮助你管理和定制你的页面`title`以及 `meta` 信息，支持服务端和客户端渲染。

*   安装

```
npm i react-helmet

```

## 客户端使用

组件在浏览器端渲染后会自动完成 `DOM` 操作，无需手动操作。

```
//src/client/pages/index/index.js

+ import { Helmet } from 'react-helmet';

 //....
 render() {
        //渲染数据
         const {tdk={}} = this.state.page || {};
        
       return <div>
        <Helmet>
                <title>{tdk.title}</title>
                <meta name="description" content={tdk.description}/>
                <meta name="keywords" content={tdk.keywords}/>
        </Helmet>
        首页</div>
    }


```

## 服务端使用

可以直接得到组件的`html` 内容，更方便的直出到客户端。

```
// /src/server/middlewares/react-ssr.js

+ import { Helmet } from 'react-helmet';

//....

//得到组件的序列化数据
+ const helmet = Helmet.renderStatic();

ctx.body=`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    + ${helmet.title.toString()} //直出到客户端
    + ${helmet.meta.toString()}
    <meta name="keywords" content="${tdk.keywords}" />
    <meta name="description" content="${tdk.description}" />
</head>
//....
</html>
</body>
<script type="text/javascript"  src="/index.js"></script>
`;

***


```

`react-helmet` 帮我们完成了所需的 `dom` 操作，方便快捷，同时也减少了错误。

![](https://user-gold-cdn.xitu.io/2020/1/2/16f66d68769beb66?w=500&h=375&f=png&s=80089)

![](https://user-gold-cdn.xitu.io/2020/1/2/16f66d65c2208b75?w=500&h=375&f=png&s=19981)

## 本节代码已上传

方法1

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-seo0](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-seo0)

方法2

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-seo1](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-seo1)

感谢你的阅读。

如果有问题欢迎留言，也欢迎在留言区留下你的想法和思考。