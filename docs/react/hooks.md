---
title: hooks
date: 2022-03-28 11:09:21
permalink: /pages/e25e7e/
categories:
  - react
tags:
  -
---

## 性能

性能不是一个单点问题，一旦一个应用出现性能问题一般都要整条链路一起优化，具体策略也是根据具体情况来，通常需要用到的 API：**useMemo 避免频繁的昂贵计算，useCallback 让 shouldComponentUpdate 可以正常发挥作用，memo 就是 shouldComponentUpdate**

## useEffects

1. useEffects 可以看作是 componentDidMount、componentDidUpdate 和 componentWillUnmount 三个生命周期的组合

1. 关于数组中的参数，请确保数组中包含了所有外部作用域中会随着时间变化并且在 effect 中使用的变量，否则你的代码会引用到先前渲染中的旧变量

1. 在有延迟调用的场景，且不需要重新执行 useEffect，这时又需要打印最新的外部变量，那么就不适合放到 deps 中，可以通过 ref 来解决问题

```js
const [count, setCount] = useState(0);

//通过ref记忆最新的count
const countRef = useRef(count);
useLayoutEffect(()=>{
  countRef.current = count;
},[count])

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

useEffect 可以看作是 componentDidMount、componentDidUpdate 和 componentWillUnmount 三个生命周期的组合，但其实并不完全等价，**useEffect 是浏览器渲染结束后才执行的**，而这三个生命周期函数是在**浏览器渲染之前同步执行的**，React 还有一个官方的 hook 是完全等价于这三个生命周期函数的，就是 **useLayoutEffect**

```js
const [count, setCount] = useState(0);
// useEffect(() => {
useLayoutEffect(() => {
  // 耗时 300 毫秒的计算
  const date = +new Date();
  while (+new Date() - date <= 300) {
    continue;
  }
  if (count === 0) {
    setCount(Math.random());
  }
}, [count]);
return (
  <div>
    <button onClick={() => setCount(0)}>更新count</button>
    {count}
  </div>
);
```

从这个例子可以看出 useEffect 和 useLayoutEffect 之间的区别，useEffect 是在浏览器重绘之后执行的，所以点击按钮后数字会变成 0，再变成随机数；而 useLayoutEffect 是在浏览器重绘之前同步执行的，所以**两次 setCount 合并到 300 毫秒后的重绘里**

因为 useEffect 不会阻塞浏览器重绘，而且平时业务多数场景对时机不敏感的，比如修改 dom、事件触发监听，所以**首推 useEffect 来处理 side effect，性能上的表现更好一些**

## useMemo

useMemo 返回的是一个值，是拿来保持一个对象引用不变的，用于避免在每次渲染时都进行高开销的计算

useMemo 的粒度是原子性的，useMemo 中用到其他引用类型也要做 memo，否则在某些场景下 useMemo 可能会失效。比较复杂的业务场景建议配合 useWhatChanged 和 Profile 一起使用。

memo 直译过来是“备忘录”，本质上它就是一个对象的引用记录下来防止函数组件弄丢而已，实现原理也很简单，用 useRef 就可以实现：

```js
// 只是一个简单实现，不是实际实现
function useMemo(callback, deps) {
  const refResult = React.useRef(callback());
  const depsRef = React.useRef(deps);

  const isDepsChanged = deps.some(
    (dep, index) => dep !== depsRef.current[index]
  );

  depsRef.current = deps;

  // 依赖变化才重新执行 callback
  if (isDepsChanged) {
    refResult.current = callback();
  }

  return refResult.current;
}
```

### useDeepMemo

useMemo 是浅比较，useDeepMemo 是深比较，简单实现 useDeepMemo：

```js
function useDeepMemoize(value: any) {
  const ref = React.useRef([]);

  if (!_.isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current;
}
// 实现useDeepMemo
function useDeepMemo(callback: any, value: any) {
  return useMemo(callback, useDeepMemoize(value));
}
```

useDeepMemo 适用于对对象的处理

```js
function LineChart({ dataConfig, fetchData }) {
  //使用useDeepMemo对dataConfig做一个缓存
  const memoDataConfig = useDeepMemo(() => dataConfig, dataConfig);
  React.useEffect(() => {
    fetchData(memoDataConfig);
  }, [memoDataConfig, fetchData]);
}
```

对于函数的处理，只需要用 useRef 做一个缓存就可以了：

```js
function LineChart({ dataConfig, fetchData }) {
  //使用useDeepMemo对dataConfig对象做一个缓存
  const memoDataConfig = useDeepMemo(() => dataConfig, dataConfig);
  //使用useRef对函数做一个缓存
  const refFetchData = React.useRef(fetchData);

  React.useEffect(() => {
    refFetchData.current(memoDataConfig);
  }, [memoDataConfig]);
}
```

### memo

只用 useMemo 和 useCallback 来做性能优化可能无法达到预期效果，原因是如果 props 引用不会变化，子组件不会重新渲染，但它依然重新执行

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

所以需要搭配**memo**，它相当于 PureComponent，是一个高阶组件，**默认对 props 做一次浅比较，如果 props 没有变化，则子组件不会重新执行**

### componentWillReceiveProps

componentWillReceiveProps 是在组件接收到新 props 时执行的，和 useEffect 的执行时机完全不一致，事实上它和 useMemo 才是执行时机一致的，但**为什么推荐用 useEffect 而不是 useMemo 来替代它呢**？

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

很明显前 3 种情况对时机不敏感，在 class component 中 componentWillReceiveProps 可以第一时间拿到 props 和 nextPros，方便对比，而现在 React 已经接管了对比工作，所以完全可以使用 useEffect 来代替，不阻塞浏览器重新渲染，用户会觉得页面更加流畅

对于第 4 种情况我们需要思考一下，在组件更新期间更新状态是否是一个恰当的行为？如果是 Function Component 中，确实是一个适合使用 useMemo 的场景，因为依赖变了所以对象更新了

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

## 参考

[React Hooks: 深入剖析 useMemo 和 useEffect](https://zhuanlan.zhihu.com/p/268802571)
