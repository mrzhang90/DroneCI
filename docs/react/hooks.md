## useMemo

1. 能用其他状态计算出来就不用单独声明状态
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

## useEffects

1. 关于数组中的参数，请确保数组中包含了所有外部作用域中会随着时间变化并且在 effect 中使用的变量，否则你的代码会引用到先前渲染中的旧变量

2. 在有延迟调用的场景，且不需要重新执行 useEffect，这时又需要打印最新的外部变量，那么就不适合放到 deps 中，可以通过 ref 来解决问题

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
