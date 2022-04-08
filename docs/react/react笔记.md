---
title: react笔记
date: 2022-03-02 10:49:37
permalink: /pages/cd74a5/
categories:
  - react
tags:
  -
---

## React 三大体系

1. React.js 用于 Web 开发和组件的编写
2. ReactNative 用户移动端开发
3. ReactVR 用于虚拟现实技术的开发

## React Fiber

React Fiber 版本，也就是 React16 版本

## React 和 Vue 对比

React.js 相对于 Vue.js 它的灵活性和协作性更好些，所以在处理复杂项目或公司核心项目时，React 是我的第一选择。Vue.js 有着丰富的 API，实现起来更简单快速，所以当团队不大，沟通紧密时，我会选择 Vue，因为它更快速易用

## Fragment 标签

react 要求必须在一个组件的最外层包裹一个元素，否则会报错，但有时布局是不需要这个外层标签，这种矛盾在 React16 已经做了解决，可以用 Fragment 标签

```js
import React,{Fragment} from 'react'

...
<Fragment>
  检查元素查看，并没有Fragment标签
</Fragment>
<>
  这种标签可以代替Fragment,效果一样
</>
...
```

## bind this

```js
class Button extends React.Component {
  handleClick() {
    console.log(this instanceof Button);
  }

  render() {
    return <button onClick={this.handleClick.bind(this)}>点击</button>;
  }
}
```

此时发现，this 指向了组件实例，符合预期，~~如果去掉 bind(this)，this 会指向 window~~

### 为何去掉 bind this 会这样

首先，JSX 实际上是 createElement 的语法糖

```jsx
<div>Hello,{this.props.name}</div>;
等价于;
React.createElement('div', null, `Hello,${this.props.name}`);
```

#### createElement 伪代码

```js
function createElement(dom, param) {
  var domObj = document.createElement(dom);
  domObj.onClick = param.onclick;
  domObj.innerHTML = param.conent;
  return domObj;
}
```

可以看到，自定义组件类中 onclick 绑定的事件，是作为回调函数绑定到 domObj.onclick 上的

#### onclick 事件触发

button 被点击时，会由 React 作为中介调用回调函数，此时的 this 指向丢失，就指向了 window

### bind this 的原理

#### new 关键字

在使用 new 关键字时，构造函数（即 class）中的 this 都会强制赋值为新的对象

#### 使用 bind 将 this 的值绑定在函数中

#### 除了 bind，还可以使用箭头函数方式

```js
class Button extends React.Component {
  handleClick() {
    console.log(this instanceof Button);
  }

  render() {
    return (
      <button
        onClick={() => {
          this.handleClick;
        }}
      >
        点击
      </button>
    );
  }
}
```

## JSX 中的 html 解析问题

如果想在 JSX 中渲染 h1 标签，默认是不会生效的，只会把 h1 打印到页面上，那么可以用 dangerouslySetInnerHTML 属性解决

```jsx
<ul>
  {this.state.list.map((item, index) => {
    return <li key={index} dangerouslySetInnerHTML={{ __html: item }}></li>;
  })}
</ul>
```

## React 调试工具-React developer tools

1. chrom 浏览器，菜单中选择更多工具，再选择扩展程序
2. 点击打开 chrom 网上应用商店，直接搜索 React，出现的第一个就是
3. 点击添加至 Chrome，然后就是等待了

### React developer tools 的三种状态

1. 灰色，这种就是不可使用，说明页面不是 React 编写
1. 黑色，说明页面是 React 编写，并处于生产环境
1. 红色，说明页面是 React 编写，并处于调试环境

## 多层组件传递数据

当需要跨多层组件传递数据时，优先选择**组件组合**
其次选择**Context**

## Class 组件 与 函数组件

Class 组件中我们需要自己管理依赖，比如生命周期 componentWillReceiveProps，是在组件接收到 props 时执行的，可以拿到 props 和 nextProps，我们需要手动判断前后 props 是否发生了变化，从而决定是否渲染；

在函数组件中我们把依赖交给 React 自动管理了，虽然减少了手动 diff 的工作量，但也带来了副作用：因为 React 做的是浅比较(Object.is())，所以当**任何一个依赖项改变了都应该重新处理 hooks 中的逻辑**，如果一个依赖的函数改变了，可能确实是函数体已经改变了。

```js
const [aa, seta] = useState('a');

const onSubmit: any = () => {
  console.log('--onSubmit--', aa);
}; //普通函数，每一次state变化，都会生成一个新的onSubmit
return (
  <div>
    <MemoBtn onSubmit={onSubmit}>{aa}</MemoBtn>
    <button
      onClick={() => {
        seta((s) => (s === 'a' ? 'b' : 'a'));
      }}
    >
      {aa}
    </button>
  </div>
);
```

虽然 React 对于依赖的处理是合理的，但也需要解决引用变化导致的性能问题，有两种解决方案：

1. 将依赖数组去掉

   ```js
   //使用useCallback且不做依赖，这样只会创建一次，不会生成新的onSubmit
   const onSubmit: any = useCallback(() => {
     console.log('--onSubmit--', aaRef.current);
   }, []);
   ```

2. 想办法让引用不变化，利用 useCallback、useMemo、React.memo 来解决函数引用的问题
   **useCallback、useMemo 可以避免在每次 state 更新时引用发生变化，memo 可以对 props 做浅比较**

   ```js
   //MemoBtn组件
   export default React.memo(({ onSubmit, children }: any) => {
     //memo,默认对props做一次浅比较，如果props没有变化，则子组件不会重新执行
     console.log('--I am a memo btn--');
     return <button onClick={onSubmit}>按钮-{children}</button>;
   });
   ```

   ```js
   // 父组件
   const [aa, seta] = useState('a');
   const aaRef = useRef(aa);
   useLayoutEffect(() => {
     aaRef.current = aa;
   }, [aa]);

   // const onSubmit: any = useMemo(() => {//这里用useMemo也可以
   const onSubmit: any = useCallback(() => {
     console.log('--onSubmit--', aaRef.current);
   }, [aaRef]); //ref只在创建时更新，其属性current跟随state变化，所以不会生成新的onSubmit
   return (
     <div>
       <MemoBtn onSubmit={onSubmit}>{aa}</MemoBtn>
       <button
         onClick={() => {
           seta((s) => (s === 'a' ? 'b' : 'a'));
         }}
       >
         {aa}
       </button>
     </div>
   );
   ```

### 函数组件

```js
function App(props) {
  return <h1>hello {props}</h1>;
}
```

这种纯函数，没有状态，没有生命周期，也不能代替类
React Hooks 的设计目的，就是加强函数组件

### class 组件

1.  创建一个同名的 ES6 class，并且继承于 React.Component
2.  添加一个 constructor 构造函数，添加 super(props)继承父类 props
3.  添加一个空的 render()方法
4.  在 render()方法中，renter 一个 DOM 元素
5.  在 render()方法中，使用 this.props、this.state 或 this.方法
6.  生命周期，ComponentDidMount 当组件插入 DOM，触发生命周期
7.  生命周期，componentWillUnmount 当组件从 DOM 移除，触发生命周期

变更变量时，

```js
const [userInfo,setUserInfo]=useState({
  firstName,
  lastName
})
// 函数组件，变更firstName变量一定要带上老的字段
setUserInfo(s=>{
  ...s,
  firstName
})
// Class组件，变更firstName变量，state会自动合并的
this.setState({
  firstName
})
```

## setState

react 会把多个 setState 调用合并成一个调用

```js
this.setState({
  count: this.state.count + 1,
});
this.setState({
  count: this.state.count + 1,
});
```

所以，以上代码相当于只执行了一次，只会加 1
如果期望的结果是两次加 1 都生效，那么可以让 setState 接口一个函数而不是对象，这个函数用上一个 state 作为第一个参数，

```
this.setState({
  count: this.state.count + 1,
});
this.setState((state) => ({
  count: state.count + 1,
}));
```

以上，执行的结果实际加 2
