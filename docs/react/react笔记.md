---
title: react笔记
date: 2022-03-02 10:49:37
permalink: /pages/cd74a5/
categories:
  - react
tags:
  - 
---
## React三大体系
1. React.js 用于Web开发和组件的编写
2. ReactNative 用户移动端开发
3. ReactVR 用于虚拟现实技术的开发

## React Fiber
React Fiber版本，也就是React16版本

## React 和 Vue对比
React.js相对于Vue.js它的灵活性和协作性更好些，所以在处理复杂项目或公司核心项目时，React是我的第一选择。Vue.js有着丰富的API，实现起来更简单快速，所以当团队不大，沟通紧密时，我会选择Vue，因为它更快速易用

## Fragment标签
react要求必须在一个组件的最外层包裹一个元素，否则会报错，但有时布局是不需要这个外层标签，这种矛盾在React16已经做了解决，可以用Fragment标签
```
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
```
class Button extends React.Component{
  handleClick(){
    console.log(this instanceof Button)
  }

  render(){
    return (
      <button onClick={this.handleClick.bind(this)}>点击</button>
    )
  }
}
```
此时发现，this指向了组件实例，符合预期，~~如果去掉bind(this)，this会指向window~~

### 为何去掉bind this会这样
首先，JSX实际上是createElement的语法糖
```jsx
<div>Hello,{this.props.name}</div>
等价于
React.createElement('div',null,`Hello,${this.props.name}`)
```

#### createElement伪代码
```js
function createElement(dom,param){
  var domObj = document.createElement(dom)
  domObj.onClick = param.onclick
  domObj.innerHTML = param.conent;
  return domObj
}
```
可以看到，自定义组件类中onclick绑定的事件，是作为回调函数绑定到domObj.onclick上的

#### onclick事件触发
button被点击时，会由React作为中介调用回调函数，此时的this指向丢失，就指向了window

### bind this的原理
#### new关键字
在使用new关键字时，构造函数（即class）中的this都会强制赋值为新的对象
#### 使用bind讲this的值绑定在函数中
#### 除了bind，还可以使用箭头函数方式
```
class Button extends React.Component{
  handleClick(){
    console.log(this instanceof Button)
  }

  render(){
    return (
      <button onClick={()=>{this.handleClick}}>点击</button>
    )
  }
}
```

## JSX中的html解析问题
如果想在JSX中渲染h1标签，默认是不会生效的，只会把h1打印到页面上，那么可以用dangerouslySetInnerHTML属性解决
```jsx
<ul>
  {
    this.state.list.map((item,index)=>{
      return (
        <li
          key={index}
          dangerouslySetInnerHTML={{__html:item}}
          >
        </li>
      )
    })
  }
</ul>
```

## React调试工具-React developer tools
1. chrom浏览器，菜单中选择更多工具，再选择扩展程序
2. 点击打开chrom网上应用商店，直接搜索React，出现的第一个就是
3. 点击添加至Chrom，然后就是等待了

### React developer tools的三种状态
1. 灰色，这种就是不可使用，说明页面不是React编写
1. 黑色，说明页面是React编写，并处于生产环境
1. 红色，说明页面是React编写，并处于调试环境