---
title: react技巧
date: 2022-03-24 11:02:00
permalink: /pages/810428/
categories:
  - react
tags:
  -
---

## 父组件调用子组件方法

父组件

```js
//引入子组件
import { useRef } from 'react';
import ChildDemo from 'xx'
...
const childDemo=useRef(ChildDemo)
//调用子组件方法
childDemo.current.handleChild()
```

子组件 ChildDemo

```js
import { forwardRef, useImperativeHandle } from 'react';
const Index = forwardRef((ref) => {
  useImperativeHandle(ref, () => ({
    handleChild,
  }));
  const handleChild = () => {};
  return <div></div>;
});
export default Index;
```

## unstable_batchedUpdates

为了解决异步批量更新状态引起的问题，react 提供了一个临时 api unstable_batchedUpdates 进行批量更新

```js
//引入
import { unstable_batchedUpdates } from 'react-dom';

//定义state
const [aa, setA] = useState(1);
const [bb, setB] = useState(1);

//解决异步批量更新
unstable_batchedUpdates(() => {
  setTimeout(() => {
    setA(2);
    setB(3);
  }, 1000);
});
```

如上代码所示，只需要将批量更新状态的代码用 unstable_batchedUpdates 包裹起来就可以了；
**使用场景：** 在批量更新状态的时候引起请求重复发送，页面渲染卡顿等影响用户体验的时候，就可以用这个 api
