---
title: react高阶组件
date: 2022-04-01 11:34:10
permalink: /pages/02cfcf/
categories:
  - react
tags:
  -
---

## 属性代理

属性代理，就是用组件包裹一层代理组件，在代理组件上，可以做一些对源组件的强化操作。这里注意属性代理返回的是一个新组件，被包裹的原始组件，将在新的组件里被挂载

```js
function WrapComponent() {
  return <div>wrap component</div>;
}
function HOC(WrapComponent) {
  return class Advance extends React.Component {
    state = {
      name: 'alien',
    };
    render() {
      return <WrapComponent {...this.props} {...this.state} />;
    }
  };
}
export default HOC(WrapComponent);
```

低耦合、对于条件渲染和 props 属性增强、适合做开源项目，适用于类组件和函数组件、完全隔离业务组件的渲染、多个 HOC 可以嵌套

## 反向继承

反向继承和属性代理有一定的区别，在于包装后的组件继承了原始组件本身，所以此时无须再去挂载业务组件

```js
class Index extends React.Component {
  render() {
    return <div>Index</div>;
  }
}

function HocExtends(Component) {
  return class HocExtends extends Component {};
}

export default HocExtends(Index);
```

方便获取组件内部状态、es6 继承可以良好继承静态属性、函数组件无法使用、多个反向继承 HOC 嵌套当前状态会覆盖上一个状态

### 渲染劫持

HOC 反向继承模式，可以通过 super.render()得到 render 之后的内容，利用这一点可以做渲染劫持，甚至可以修改 render 之后的 React element 对象

```js
function HocExtends(Component) {
  return class HocExtends extends Component {
    if(this.props.visible){
      return super.render() //得到render后的内容
    }else{
      return <div>暂无数据</div>
    }
  };
}
```

#### 修改渲染树

```js
class Index extends React.Component {
  render() {
    return (
      <ul>
        <li>react</li>
        <li>vue</li>
        <li>angular</li>
      </ul>
    );
  }
}
function HocExtends(Component) {
  return class HocExtends extends Component {
    render() {
      if (this.props.visible) {
        const element = super.render();
        const children = element.props.children;
        // 替换angular的元素节点
        const appendElement = React.createElement(
          'li',
          null,
          `hello world,my name is john`
        );
        const newElement = React.Children.map(children, (child, index) => {
          if (index === children.length - 1) return appendElement;
          return child;
        });
        return React.cloneElement(element, element.props, newElement);
      } else {
        return '暂无数据';
      }
    }
  };
}
export default HocExtends(Index);
```

### 强化 props

强化 props 就是在原始组件的 props 基础上，加入一些其他 props，强化原始组件功能
