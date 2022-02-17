---
title: 4 - 好技术也得学会怎么用 ───  TypeScript 的使用【基础】
date: 2020-06-18 15:23:04
permalink: /pages/3d1f6c/
categories:
  - 基于 NodeJS 构建 GraphQL API 服务
tags:
  - 
---
# TypeScript 的使用

因为我们这本小册不是专为为了学习 TypeScript 的，在此我就不带领大家从环境安装开始了。我们使用 TypeScript官方所提供的 [在线运行](http://www.typescriptlang.org/play/index.html?ssl=7&ssc=16&pln=1&pc=1#code/Q) 工具来学习 TypeScript 的使用。本篇是 TypeScript 的最后一篇，比较长，大家耐心看下去哦。

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a6117b404ac0?w=1906&h=900&f=png&s=48089)

## 编写第一个 TypeScript 程序

我们在这个编辑工具中输入以下代码：

```
function greeter(person) {
    return `Hello, ${person}`;
}

```

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a618d528a115?w=821&h=249&f=png&s=25142)

我们可以看到编辑器给了我们一段警告，这段警告翻译成中文的意思就是：对于隐式含有 `any` 类型的参数或者变量进行警告⚠️这是因为 TypeScript 默认开启了严格模式

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a62641a4a88d?w=1500&h=800&f=jpeg&s=58343)

规则如下：

规则名称

解释

`noImplicitAny`

不允许变量或函数参数具有隐式 any 类型

`noImplicitThis`

不允许 this 上下文隐式定义

`strictNullChecks`

不允许出现 null 或 undefined 的可能性

`strictPropertyInitialization`

验证构造函数内部初始化前后已定义的属性

`strictBindCallApply`

对 bind、call、apply 更严格的类型检测

`strictFunctionTypes`

对函数参数进行严格逆变比较

而我们正是触犯了 `noImplicitAny` 这条规则，我们对上边那段代码进行如下修改：

```
function greeter(person: string) {
    return `Hello, ${person}`;
}

```

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a631ac56a3a1?w=878&h=98&f=png&s=7723)

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a6361fd7912d?w=870&h=222&f=png&s=17979)

可以看到这个警告已经消失了，并且看到 `greeter` 的返回值自动推导为 `string` 类型。 之所以一开始就开启严格模式，主要目的有以下几点：

1.  消除 JavaScript 中的一些不合理、不严谨的之处，减少一些怪异行为
    
2.  消除代码运行的一些不安全之处，保证代码运行的安全
    
3.  提高编译器效率，增加运行速度
    
    ...
    

## 数据类型

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a63f45a72780?w=1600&h=684&f=jpeg&s=267549)

TypeScript 的数据类型有很多，有一些相信大家已经熟练掌握了。我就不一一为大家介绍了，主要为大家介绍一下 以下几种：

### 元组 Tuple

元组类型允许表示一个已知元素数量和类型的数组，各元素的类型不必相同。看下方示例：

```
// 声明一个元组类型
const info: [string, number] = ['Jack', 20]; // OK

// 如果你的数组没有满足元组要求 
const info: [string, number] = [20, 'Jack']; // Error
// Type 'number' is not assignable to type 'string'.
// 这个错误是因为不能将数字类型分配给字符串类型

const info: [string, number] = ['Jack']; // Error
// Property '1' is missing in type '[string]' but required in type '[string, number]'.
// 这个错误大概意思就是缺少一个属性，但在元组中设定是必须的

```

由此我们可以看出顺序不可以颠倒，长度不可以违规，是固定的。

### 枚举

`enum`类型是对 JavaScript 标准数据类型的一个补充。 像 **C#** 等其它语言一样，使用枚举类型可以为一组数值赋予友好的名字。

#### 数字枚举

我们先来看一下数字枚举：

```
enum Direction {
	Top,   // 我们可以初始化，比如 Top = 1
    Bottom,
    Left,
    Right
}

```

我们定义了一个数字枚举。默认情况下，从`0`开始为元素编号，简单来说`Top` 的默认初始值为 **0**，其余的成员会从 **0** 开始自动增长。也就是 `Top` 的值为 **0**、`Bottm` 的值为 **1**、`Left` 的值为 **2**、`Right` 的值为 **3** 。当前你也可以手动的指定成员的数值，如上方我们的注释。

#### 字符串枚举

字符串的枚举概念很简单，但跟数字枚举有一定的差别。在字符串枚举中，每个成员都必须使用字符串字变量，并且字符串没有自增长的行为，字符串枚举可以很好的序列化。简单来说就是字符串相比较于数字枚举的可读性更高。

```
enum Direction {
	Top = "Top",
    Bottom = "Bottom",
    Left = "Left",
    Right = "Right"
}

```

### Any

`Any` 类型可以表示任意类型的值。虽然比较任性，但是在实际开发中的作用还是非常大的，当你无法确定一个值的具体类型时，这个时候可以使用 any 在编译阶段通过类型检查。

```
let random: any = 'Jack'; 	// OK
random = 4;					// OK
random = (() => {})			// OK

```

特点：

1.  `any` 类型的变量可以被赋值任何类型数据
    
2.  `any` 类型的数据可以赋值给除 `never` 外的任何数据类型变量
    
3.  如果是 `any` 类型，那么可以访问它的任意属性（即便不存在）
    
4.  any`类型对象任意属性值都是`any\` 类型
    
5.  `any` 类型数据可以当做函数或者构造函数调用，可以有任意参数
    
6.  如果没有明确给出数据类型，并且编译器无法推断，那么将被规定为 `any` 类型
    

总的来说 `Any` 这个类型好用，但是不能滥用，并且我们在开发中更要避免 `Any` 类型，因为这个类型只能在运行时报错，这样就很难发现某个小角落的错误。

### Void

简单来说如果方法没有返回值，那么此方法的返回值类型就是 `Void` 类型

```
function test() : void {
	console.log('Hello Void');
}

```

### Never

`never` 类型表示的是那些永不存在的值的类型。使用场景主要是那些抛出异常或根本不会有返回值的函数表达式或箭头函数表达式的返回值类型。下方是官方给出的一些返回 `never` 的函数：

```
// 返回never的函数必须存在无法达到的终点
function error(message: string): never {
    throw new Error(message);
}

// 推断的返回值类型为never
function fail() {
    return error("Something failed");
}

// 返回never的函数必须存在无法达到的终点
function infiniteLoop(): never {
    while (true) {
    }
}

```

### 类型断言

有时候你会遇到这样的情况，你会比 TypeScript 更了解某个值的详细信息。 通常这会发生在你清楚地知道一个实体具有比它现有类型更确切的类型。

通过_类型断言_这种方式可以告诉编译器，`“相信我，我知道自己在干什么”`。 类型断言好比其它语言里的 **类型转换**，但是不进行特殊的数据检查和解构。 它没有运行时的影响，只是在编译阶段起作用。 TypeScript会假设你，程序员，已经进行了必须的检查。

#### 尖括号语法

```
function info(name : string, age : string | number) {
    if ((<string>age).length) {				//断言
        console.log((<string>age).length)	//断言
    }  else {
        console.log(age.toString)
    }
}

```

#### AS 语法

```
function info(name : string, age : string | number) {
    if ((age as string).length) {				//断言
        console.log((age as string).length)		//断言
    }  else {
        console.log(age.toString)
    }
}

```

两种形式是等价的。 至于使用哪个大多数情况下是凭个人喜好；然而，当你在TypeScript里使用 `JSX` 时，只有 `as`语法断言是被允许的。

## 语法特性

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a66de55d5cc1?w=640&h=427&f=jpeg&s=25955)

看见女神就想冲上去加微信，要号码，甚至还想知道年龄，三围，体重，兴趣爱好？但这是人家的隐私好嘛！问不到资料怎么办？如果小姐姐对你也有点兴趣，当然会指点你，“后面那个是我闺蜜~”。

```
// 封装一个类 小姐姐的信息都在里面
class Beauty {
    puublic  height: number = 170
    public bust: number = 84
    public waist: number = 62
    public hip: number = 86
    public hobby: Array<string> = ['吃', '喝', '玩', '乐']
	
    // 身高
    public getHeight() : number {
        return this.height
    }
	
    // 三围
    public getMeasurement() : string {
        return `胸围(${this.bust})、腰围(${this.waist})、臀围(${this.hip})`
    }
	
    // 爱好
    public getHobby() : Array<string> {
        return this.hobby
    }
	
	// 秘密
	private secret() {}
}

export default new Beauty() 

```

小姐姐的闺蜜却想作弄你一番，必须要回答她几个问题：

```
// 接口
interface IPrivacy { 
    height: number      	// 身高
    abs: number				// 腹肌
    hobby: Array<string>	// 爱好
}

class Beauty {
   ...
   // 构造方法
    constructor(information: IPrivacy) {

    }
   ...
}

```

为了小姐姐的隐私，我们当然是知无不言言无不尽：

```
const beauty = new Beauty({
    height: 180,
    abs: 8,
    hobby: ['抽烟', '喝酒', '烫头']
})

// 于是我们开开心心的拿到了小姐姐除了隐私之外的资料
console.log(beauty.getHeight()) // 170
...

```

每位小姐姐都有共同的特点，于是我们创建了`Goblin` 这个类去继承了上方的例子：

```
class Goblin extends Beauty {
	hobby: Array<string> = ['逛街', '旅游']
}

const goblin = new Goblin({
    height: 180,
    abs: 8,
    hobby: ['抽烟', '喝酒', '烫头']
})

console.log(beauty.getHeight()) // 170
console.log(beauty.getHobby()) // ["逛街", "旅游"]
console.log(beauty.secret())  // Property 'secret' is private and only accessible within class 'Beauty'. 这里的意思告诉我们 secret 是私人的不允许被继承

```

### 类 Classes

如果您有其他面向对象语言的经验，那么 `类` 就是比较简单的常用类型，结合上方的例子。我给大家总结以下几点：

#### 修饰符

TypeScript 里面定义属性的时候给我们提供了 三种修饰符：

*   **public** : 在 TypeScript 的类中，成员都默认为 public, 被此限定符修饰的成员是可以被外部访问。
*   **protected**： 当成员被设置为 protected 之后, 被此限定符修饰的成员是只可以被类的内部以及类的子类访问。
*   **private** ： 当成员被设置为 private 之后, 被此限定符修饰的成员是只可以被类的内部访问。

#### 封装

把客观的事物封装成抽象的类，并且类可以把自己的数据和方法只让可信的类或者对象操作，对不可信的类进行信息的隐藏。简单的说就是：封装使对象的设计者与对象的使用者分开，使用者只要知道对象可以做什么就可以了，不需要知道具体是怎么实现的。封装可以有助于提高类和系统的安全性。

#### 继承

继承指的是建立一个新的派生类，从先前定义的类中继承数据和函数，可以重新定义或加进新数据和函数，从而建立了类的层次或等级。

注意：**我们无法继承私有的属性或方法**

#### 多态

多态性指的是： 同一操作作用与不同类的实例，将产生不同的执行结果，即不同类的对象收到相同的消息时，将得到不同的结果。

### 接口 Interface

利用接口约束了传入变量的内容，注意，在赋值时：**变量的形状必须和接口的形状保持一致。**

在面向对象的编程中，接口是一种规范的定义，它定义了行为和动作规范，在程序设计里面，接口起到了一种限制和规范的作用。

接口定义了某一批类所需要遵守的规范，接口不关心这些类的内部状态数据，也不关心这些类里面方法的实现细节，它只规定这批类里面必须提供某些方法，提供这些方法的类就可以满足实际需要

## 小结

这一节我们学习了 TypeScript语法的一些理念，结合一个例子诠释了类的三大特性封装、继承、多态。并在这个例子中使用接口去约束我们传入的变量，上方例子中的代码还是希望大家多多练习哦。