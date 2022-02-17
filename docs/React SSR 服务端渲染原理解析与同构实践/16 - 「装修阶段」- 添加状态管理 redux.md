---
title: 16 - 「装修阶段」- 添加状态管理 redux
date: 2020-06-18 15:25:11
permalink: /pages/37c9ed/
categories:
  - React SSR 服务端渲染原理解析与同构实践
tags:
  - 
---
## 导读

本节标题：「装修阶段」- 添加状态管理 redux

本节主旨：完善骨架模型，支持 redux 状态管理，重点关注如何实现数据同构

本节配套代码：

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-redux](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-redux)

# 正文

小册的内容进行到这里，本应用骨架的搭建已经接近尾声，整体上目前已经比较完善，可以用到实际项目开发中。

目前还缺少一个可选的能力 - 状态管理。

业内最有名的状态管理工具肯定是`redux`了，但实际上它并不是必须的，在实际项目中到底需不需要使用它，要根据自己的实际情况来定。

为了给我们实际场景中多一个选型，这一节我们将`redux`状态管理融入到我们的骨架中。

# redux 介绍

这里对`redux`做一个简单介绍，便于把大家带入主题。

在复杂应用中组件间的数据通信可能非常复杂，单纯通过层级关系进行数据传递会显得力不从心，难以维护。所以此时会使用`redux`来进行状态管理，或者其他的一些状态管理工具如`mobx`。

`redux`借鉴了函数式编程的思想，采用`Flux`单向数据流理念，将应用状态全局化、中心化，同时为实现对状态的管理封装了不同的方法，实现数据的顶层分发，并对我们的操作进行规范和约束。

可以参考下图来理解其理念。

![](https://user-gold-cdn.xitu.io/2020/1/10/16f8f245788e6879?w=533&h=221&f=png&s=85971)

![](https://user-gold-cdn.xitu.io/2020/1/10/16f8f1cd4cc32e3c?w=600&h=132&f=png&s=11513)

可能上面说的有点抽象，用人类的语言再说一下。

`redux` 将应用的数据`state`,集中到一个地方来进行存储管理，而不需要再单独的在组件内维护状态，状态的更新只能通过`redux`提供的规范和`api`来进行处理.。不在需要我们来手动调用`setState`来更新组件，其内部已经帮我们完成。

下面用伪代码简单介绍`redux`各个部分，帮我们更进一步理解`redux`。

*   数据管理 - `Store`

`Store` 是`redux`唯一保存所有`state`的容器,包含应用的状态和逻辑。

```
//创建一个store
const store = createStore(reducer, defualtState);

//获得 store内的状态
const state = Store.getState();

```

*   数据源 - `Action`

表示在客户端触发，用于更新状态的动作,同时包含具体的数据，它是一个纯声明的数据结构，不提供逻辑。

在执行状态更新之前都会先产生一个`action`对象,用于来获取具体的数据。

```
{
    type:'getList',
    data:{
        list:[1,2,3]
    }
}

```

*   状态整合 - reducer

`reducer`是一个纯函数，用于接收`action`，根据`action`的`type`和数据(data),来返回一个新的`state`。

```
function xxxReducer(state = {},action){
    switch(action.type){
        case 'ADD':
            return {
                ...state,
                count:action.count
            }
    }
}

```

上面函数接收 `state` 和 `action` 两个参数, 其中 `state` 为上一个状态，也就是发起 `action` 时 `store`中的状态。

`action` 为一个真实的对象，其中必须含有一个为 `type`的属性。`reducer` 就是通过这个`action.type` 进行判断，来返回不同的 `state`。

*   数据更新 - dispatch

`dispatch`是`store`暴露出的一个方法，用于执行对`store`内数据的更新，它接收一个`action`对象，其内部会调用`reducer`来返回最新的状态，最后完成状态的更新。

```
dispatch(action);//更新数据

const store  = store.getState();//获取最新数据


```

# 中间件和异步

上面是`redux`的基本用法，但是还不够。因为实际中没有那么简单的项目，比如我要从接口获取数据怎么办。

咱们上面介绍的只是在同步情况下的处理，更新数据直接`dispath(action)`就可以。

为此`redux`提供了一套中间件机制，可以让我们在派发`action`和执行`reducer`之间，做一些操作，比如做一个异步操作（从接口中拿数据）。

`redux`本身提供了`appleMiddleware`方法来接入中间件。

```
const store = createStore(reducer, defualtState, applyMiddleware(..));

```

这里提一个比较常用的中间件`redux-thunk`，包括我们下面的实践中也会用这个。

# `react-redux`

为了更加方便的使`redux`和`react`相结合，我们需要使用`react-redux`库。

该库把`react`和`redux`链接在一起，内部进行了极强的封装，不在需要我们手动调用`setState`进行数据更新,当我们执行`dipatch(action)`时会自动更新状态，同时重新渲染组件。

该库更细节的使用就不多说了，更详细的可以参考下官方的文档。

[https://react-redux.js.org/](https://react-redux.js.org/)

下面我们来进行实践，在我们的`react ssr`应用骨架内接入`redux`。

# ssr 接入 redux

使用`redux`进行状态管理，虽然并不是必须的，但是从使用层面来讲可以大大简化我们的代码，更方便后期的维护，代码结构更清晰。

如何接入呢？

其实和我们开发`SPA`应用的使用方式差不多，只是需要针对双端做一些调整。

**下面我们在上一节代码基础上进行改造。**

## 准备工作

安装基础库

```
npm i redux react-redux redux-thunk

```

## 创建 store

状态都由`store`来进行管理和存储，所以首先要先有`store`。

```
// ./src/client/share/redux/store.js

import {createStore, applyMiddleware, combineReducers} from 'redux';
import thunk from 'redux-thunk';
import reducer from './reducer';

export default (defualtState={}) => {
  return createStore(reducer, defualtState, applyMiddleware(thunk));
}


```

上面是一个同构方法，双端都会调用。由于`node`模块具有缓存机制，所以我们需要导出一个函数来每次都能返回最新的`store`。

## 创建 reducer

该模块会对各个页面内的子`reducer`进行合并。

```
// ./src/client/share/redux/reducer.js

//列表页面的子 reducer
import { reducer as listPage } from '../../client/pages/list/redux/index';

//关于页面的子 reducer
import { reducer as aboutPage } from '../../client/pages/about/redux/index';

//合并多个 reducer
import {combineReducers } from 'redux';

export default combineReducers({
    listPage,
    aboutPage
});


```

## 客户端渲染

首先要获得`sotre`对象，利用`Provider`组件可以使子组件从`context`上得到`store`。

```
// ./src/client/app/index.js

import { Provider } from 'react-redux';
import getStore from '../../share/redux/store';

function renderDom(routeList,initialData) {
        
        const insertCss = (...styles) => {
                const removeCss = styles.map(style => style._insertCss());//客户端执行，插入style
                return () => removeCss.forEach(dispose => dispose());//组件卸载时 移除当前的 style 标签
        }

        //得到 store 对象
        const store = getStore(initialData);
        
        //将store 放入全局，方便后期的使用
        window.__STORE__ = store;
        
        //传递 store
        ReactDom.hydrate(<Provider store={store}>
        <BrowserRouter>
            <StyleContext.Provider value={{ insertCss }}>
            <App routeList={routeList} />
            </StyleContext.Provider>
        </BrowserRouter>
        </Provider>,document.getElementById('root'))
}

//...

```

## 改造 列表页面

下面拿我们项目中的列表页面举例,其路由为`/list`，同时模拟了异步数据的请求。

### 创建 reducer action

个人习惯吧，我没有把`actions`,`reducer`,`action type`分文件存在，而是合并到了一起，感觉用起来更方便一些。

在`pages/list`下面创建`redux/index.js`文件。

```
//假数据
import tempData from '../data';

//action type
export const ACTION_TYPE={
  changeList:'list/changelist'
}

//用于更新状态 action creater
const changeList = list => ({
  type: ACTION_TYPE.changeList,
  list
});

//异步获得数据 【副作用】 返回Promise类型
export const getInitialData = (props) => {
  return (dispatch, getState) => {
    return new Promise(resolve=>{
    //延迟 500ms 返回数据
      setTimeout(() => {
        const data = {
          fetchData: {
            code: 0,
            data: tempData
          },
          page: {
            tdk: {
              title: '列表页 - koa-react-ssr',
              keywords: '关键词 koa-react-ssr',
              description: '描述 koa-react-ssr'
            }
          }
        }
        resolve(data);
        //更新状态
        dispatch(changeList(data));
      }, 500);
    })
  };
};


//默认数据
const defaultState = {
  fetchData:{},
  page:{}
};

// reducer 返回一个全新状态
export const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case ACTION_TYPE.changeList:
      return {//通过共享结构返回一个新对象
        ...state,
        ...action.list
      };
    default:
      return state;//返回默认
  }
}


```

### 页面组件改造

我们使用`connect`方法将组件和`redux`进行链接，以支持组件的状态传递和组件的自动更新。

另外需要对`数据预取`方法进行更改，不再是直接调用接口返回数据，而是使用`dispatch`。

```
//src/client/pages/list/index.js
//列表页 组件

import React from 'react';
import {Link} from 'react-router-dom';
import css from './list.scss';

//action  获取初始化数据
import {getInitialData} from './redux/index';

//为了方便使用，封装的一个方法，下面会介绍
import isoConnect from '../../common/components/iso-connect';

class Index extends React.Component {
    constructor(props) {
        super(props);
    }

    //数据预取方法 用于服务端调用 参数内可以获得store 
    static async  getInitialProps({store}) {
        //通过 dispach 获得数据,同时也会更新store
        return store.dispatch(getInitialData());
    }

    render() {
        //渲染数据 这里不变
        const {fetchData,page} = this.props.initialData;
        const { code, data } = fetchData||{};
        
        return <div className="list-page-box">
        {data && data.map((item,index)=>{
            return <div key={index}>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
            </div>
        })}
        {!data&&<div>暂无数据</div>}
        </div>
    }
}

//将 store 中 state 转换为 props传递给组件
const mapStateToProps = state => ({
    initialData: state.listPage,
});

//将获取数据的方法也做为 props传递给组件
const mapDispatchToProps = dispatch => ({
    getInitialData() {
        console.log('dispath fetch data');
        return dispatch(getInitialData());
    }
});

// 封装了一层，为了方便，下面有介绍
export default isoConnect({
    css,
    mapStateToProps,
    mapDispatchToProps},Index);



```

**isoConnect 方法**

由于我们的页面组件内需要做 `css`同构，需要调用`PageContainer`高阶组件（提取了组件内的重复逻辑）,现在又需要调用`connect`方法， 这样一层又一层的写法很繁琐，所以为了方便使用，需要做一层封装，提取了一个`isoConnect`方法。

```
import PageContainer from '../page-container/index';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/withStyles'

export default ({ css, mapStateToProps, mapDispatchToProps }, ActiveComponet)=>{
    return withStyles(css)
        (connect(mapStateToProps, mapDispatchToProps)(PageContainer(ActiveComponet)));
}

```

### 高阶组件改造

需要对我们的`PageContainer`组件进行改造，主要是数据预取和数据初始化的处理,同时兼容不使用`redux`的页面。

```
// ./src/client/common/comoponents/page-container
//高阶组件 用于提取重复逻辑

import React from 'react';

let _this = null;

const popStateCallback = () => {
    // 使用popStateFn保存函数防止addEventListener重复注册
    if (_this && _this.getInitialProps) {
        console.log('popStateFn');
        _this.getInitialProps();
    }
};

export default (SourceComponent) => {
    return class HoComponent extends React.Component {
        constructor(props, context) {
            super(props);
            console.log('props', props);
            this.state = {
                initialData: {},
                canClientFetch: false//浏览器端是否需要请求数据
            }
        }

        //转接子组件的预取方法，服务端会调用这个方法来做数据预取
        static async getInitialProps(ctx) {
            return SourceComponent.getInitialProps ? await SourceComponent.getInitialProps(ctx) : {};
        }

        //用于封装处理数据的更新逻辑
        async getInitialProps() {
            // ssr首次进入页面以及csr/ssr切换路由时才调用组件的getInitialProps方法
            const props = this.props;
            const store = window.__STORE__;//从全局得到 store 
            
            //兼容不使用 redux 的页面
            const res = props.getInitialData ? await props.getInitialData(store.dispatch) : (
                SourceComponent.getInitialProps? await SourceComponent.getInitialProps():{}
            );
            
            //处理页面 title 显示
            let { tdk } = res.page || {};
            if (tdk) {
                document.title = tdk.title;
            }
        }

        async componentDidMount() {

            _this = this; // 修正_this指向，保证_this指向当前渲染的页面组件
            //注册事件，用于在页面回退的时候触发
            window.addEventListener('popstate', popStateCallback);

            const canClientFetch = this.props.history && this.props.history.action === 'PUSH';//路由跳转的时候可以异步请求数据
            if (canClientFetch) {
                //如果是 history PUSH 操作 则更新数据
                await this.getInitialProps();
            }

        }

        render() {
            const props = {
                initialData: {},
                ...this.props
            };

            //客户端渲染
            if (this.state.canClientFetch) {//需要异步请求数据
                props.initialData = this.state.initialData || {};
            } else {
                props.initialData = this.props.initialData;
            }

            return <SourceComponent  {...props}></SourceComponent>
        }
    }
}

```

## 服务端渲染

只需要对`react-ssr.js`中间件做调整，导入`Provider`组件，得到`store`对象。

这里需要注意一点，调用数据预取方法后，`store`内的`state`会自动更新，组件在渲染的时候会自动获取，不在需要显示的通过`staticContext`属性进行传递。

```
// 服务端 ssr 中间件
// ./src/server/middlewares/react-ssr.js

//...
import { Provider } from "react-redux";
import getStore from '../../share/redux/store';


export default async (ctx, next) => {

   //...

    //获得静态路由
    const staticRoutesList = await getStaticRoutes(routeList);


    //查找到的目标路由对象
    let matchResult = await matchRoute(path, staticRoutesList);
    let { targetRoute, targetMatch } = matchResult;

    //得到 store,默认没有数据
    const store = getStore();

    //进行数据预取，更新 store 内的数据
    let fetchDataFn,fetchResult={};
    if (targetRoute){
        fetchDataFn = targetRoute.component ?targetRoute.component.getInitialProps:null;
        if (fetchDataFn) {
            fetchResult = await fetchDataFn({store});//更新 state 
        }
    }
    
    //从数据预取的结果中得到 page 信息
    let { page } = fetchResult || {};

    let tdk = {
        title: '默认标题 - koa+react+ssr',
        keywords: '默认关键词',
        description: '默认描述'
    };

    if (page && page.tdk) {
        tdk = page.tdk;
    }

    const context = {};
    const css = new Set();
    //css  同构
    React components
    const insertCss = (...styles) => styles.forEach(style => css.add(style._getContent()));
   
    //使用 Provider 传递 store
    const html = renderToString(<Provider store={store}><StaticRouter location={path} context={context}>
        <StyleContext.Provider value={{ insertCss }} >
            <App routeList={staticRoutesList}></App></StyleContext.Provider>
    </StaticRouter></Provider>);

    const styles = [];
    [...css].forEach(item => {
        let [mid, content] = item[0];
        styles.push(`<style id="s${mid}-0">${content}</style>`)
    });

    //静态资源
    const assetsMap = getAssets();

    ctx.body = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${tdk.title}</title>
    <meta name="keywords" content="${tdk.keywords}" />
    <meta name="description" content="${tdk.description}" />
    ${styles.join('')}
</head>
<body>
    <div id="root">
       ${html}
    </div>
    <textarea id="ssrTextInitData" style="display:none;">
    //获得store 然后序列化直出到客户端
    ${JSON.stringify(store.getState())}
    </textarea>
</body>
</html>
</body>
 ${assetsMap.js.join('')}
`;

    await next();
}

```

代码层面改造已完成，下面看下具体展示

![](https://user-gold-cdn.xitu.io/2020/1/10/16f8fabfa1f6b985?w=814&h=936&f=png&s=225535)

![](https://user-gold-cdn.xitu.io/2020/1/10/16f8faf4a7488ce5?w=946&h=957&f=png&s=807252)

# 小结

本节我们完成了同构应用内的`redux`的接入，让我们的应用骨架更加的完善。

从本次改造中可以看出大部分还是我们平时`SPA`开发中的应用，最主要的部分还是`数据预取`，考查的是我们的对同构的理解。只要你熟悉`redux`的应用，那么在搞明白数据同构之后，相信你也能较快的接入`redux`。

改造的方案很多，但是其中原理和流程都是相同的，所以我们也可以迅速的集成`mobx`。

本节完整代码已上传

[https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-redux](https://github.com/Bigerfe/koa-react-ssr/tree/better/packages/my-react-ssr-redux)

感谢你的阅读。

如果有问题欢迎留言，也欢迎在留言区留下你的想法和思考。