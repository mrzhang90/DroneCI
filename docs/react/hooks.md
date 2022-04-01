---
title: hooks
date: 2022-03-28 11:09:21
permalink: /pages/e25e7e/
categories:
  - react
tags:
  -
---

## useEffects

1. useEffects 可以看作是 componentDidMount、componentDidUpdate 和 componentWillUnmount 三个生命周期的组合

1. 关于数组中的参数，请确保数组中包含了所有外部作用域中会随着时间变化并且在 effect 中使用的变量，否则你的代码会引用到先前渲染中的旧变量

1. 在有延迟调用的场景，且不需要重新执行 useEffect，这时又需要打印最新的外部变量，那么就不适合放到 deps 中，可以通过 ref 来解决问题

```
const [count, setCount] = useState(0);

//通过ref记忆最新的count
const countRef = useRef(count);
countRef.current = count;

useEffect(() => {
  const timer = setTimeout(() => {
    console.log(countRef.current);
  }, 3000);
  return () => {
    clearTimeout(timer);
  };
}, []);

...
<button onClick={()=>{setCount(count=>count+1)}}>点击</button>
```

## useLayoutEffect

useEffect 可以看作是 componentDidMount、componentDidUpdate 和 componentWillUnmount 三个生命周期的组合，但其实并不完全等价，useEffect 是浏览器渲染结束后才执行的，而这三个生命周期函数是在浏览器渲染之前同步执行的，React 还有一个官方的 hook 是完全等价于这三个生命周期函数的，就是 useLayoutEffect

因为 useEffect 不会阻塞浏览器重绘，而且平时业务多数场景对时机都不敏感，比如修改 dom、事件触发监听，所以优先推荐 useEffect

## useMemo

### componentWillReceiveProps

componentWillReceiveProps 是在组件接收到新 props 时执行的，和 useEffect 的执行时机完全不一致，事实上它和 useMemo 才是执行时机一致的

```js
componentWillReceiveProps(nextProps) {

  if (nextProps.queryKey !== this.props.queryKey) {
    // 触发外部状态变更
    nextProps.setIsLoading(true);
    // 取数
    this.reFetch(nextProps.queryKey);
  }

  if (nextProps.value !== this.props.value) {
    // state 更新
    this.setState({
      checkList: this.getCheckListByValue(nextProps.value);
    })
  }

  if (nextProps.instanceId !== this.props.instanceId) {
    // 事件 / dom
    event.emit('instanceId_changed', nextProps.instanceId);
  }

}
```

这是一个典型的 class component，componentWillReceiveProps 经常被拿来：

1. 触发回调，造成外部状态变更
2. 事件监听和触发、dom 的变更
3. 重新取数
4. state 更新

很明显前 3 中情况对时机不明感，在 class component 时 componentWillReceiveProps 可以第一时间拿到 props 和 nextPros，方便对比，而现在 React 已经接管了对比工作，所以完全可以使用 useEffect 来代替，不阻塞浏览器重新渲染

对于第 4 中情况，可以用 useMemo，监听依赖变化从而更新对象

### 能用其他状态计算出来就不用单独声明状态

一个 state 不能通过其他 state/props 直接计算出来，否则就不用定义 state

```js
const [source, setSource] = useState([
  { type: 'done', value: 1 },
  { type: 'doing', value: 2 },
]);

// 可以用useMemo计算就用不用useState
// const [doneSource] = useState(() =>
//   source.filter((item) => item.type === 'done'),
// );
const doneSource: any = useMemo(
  () => source.filter((item) => item.type === 'done'),
  [source]
);
// const [doingSource] = useState(() =>
//   source.filter((item) => item.type === 'doing'),
// );
const doingSource: any = useMemo(
  () => source.filter((item) => item.type === 'doing'),
  [source]
);

return (
  <div>
    doneSource:{doneSource[0]['value']}
    <br />
    doingSource:{doingSource[0]['value']}
  </div>
);
```
