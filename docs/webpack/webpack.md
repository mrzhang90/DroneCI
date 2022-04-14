---
title: webpack
date: 2022-04-12 18:10:39
permalink: /pages/d0d0c0/
categories:
  - webpack
tags:
  -
---

```js
yarn add webpack webpack-cli webpack-dev-server -D
//webpack-cli，在4.x版本后不再作为webpack的依赖了，需要单独安装
//优先使用本地安装webpack，不同项目可使用不同的webpack版本，多人协作可以确保相同版本的webpack

npx webpack //运行项目内的webpack

npx webpack --version //查看项目中webpack的版本
```

## 插件

### html-webpack-plugin

将 HTML 引用路径和构建结果关联起来

## loader

由于 loader 处理的模块的转换，所以 loader 的配置是放在 module 字段下的，在 module.rules 中添加配置项，每一项被视为一条匹配使用 loader 的规则

webpack 的 loader 相关配置都在 module.rules 字段下，通过 test、include、exclude 等配置好应用的 loader 规则，然后使用 use 来指定需要用到的 loader，配置 loader 需要注意执行顺序

除此之外，webpack4.x 版本新增了 module.type 模块类型的概念，相当于 webpack 内置了一个更加底层的文件类型，暂时只支持 JS 相关支持，后续会添加 HTML 和 CSS 等类型

### resource 和 issuer

匹配条件的参数有：resource 和 issuer

```js
module.exports = {
  module: {
    rules: [
      {
        resource: {
          test: /\.jsx?/,
          include: [path.resolve(__dirname, 'src')],
        },
        //如果使用issure，便是isusre{ test:... }
      },
    ],
  },
};
```

实际上 test 和 include 都用于匹配 resource 路径，是 resource.test 和 resource.include 的简写

issure 规则匹配的场景很少见，可以用它尝试约束某些类型的文件只能引用某些类型的文件

### 规则条件配置

- test 匹配特定条件
- include 匹配特定路径
- exclude 排除指定路径
- and 必须匹配数组中的所有条件
- or 匹配数组中任意一个条件
- not 排除匹配数组中所有条件

**匹配条件的值可以是：**

1. 字符串：注意是绝对路径的字符串(path.resolve(\_\_dirname,'src'))
2. 正则表达式
3. 函数：返回 true 表示匹配
4. 数组
5. 对象

```js
rules:[
  resource:{
    test:/\.jsx?/,
    include:[
      path.resolve(__dirname,'src') //字符串，注意是绝对路径
    ],
    not:[
      (value)=>{/*...*/ return true}
    ]
  }
]
```

PS： **test/include/exclude** 是 **resource.(test/include/exclude)** 的简写，**and/or/not** 这些则需要放到 **resource** 中进行配置

### module type

webpack 4.x 强化了 module type，即模块类型的概念，不同模块类型配置不同的 loader，现阶段实现了以下 5 中模块类型：

1. javascript/auto : 即 webpack3 默认的类型，支持现有的各种 JS 模块类型-CommonJS、AMD、ESM
2. javascript/esm : ECMAScript modules
3. javascript/dynamic ： Commonjs 和 AMD，排除 ESM
4. javascript/json ： JSON 格式数据，require 或者 import 都可以引入，是 json 的默认类型
5. webassembly/exprimental ： WebAssembly modules，当前处于实验阶段，是.wasm 的默认类型

### loader 应用顺序

一个匹配规则可以配置多个 Loader，执行顺序从后往前。

```js
{
  test:/\.js/,
  type:'javascript/esm'
}
```

上述的从后往前的顺序是在同一个 rule 中进行的，那如果多个 rule 匹配了同一个模块文件，loader 的应用顺序又是怎么样的：

```js
rules: [
  {
    enforce: 'pre', //指定为前置类型
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'eslint-loader',
  },
  {
    enforce: 'post', //指定为后置类型
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader',
  },
];
```

webpack 在 rule 中提供了一个 **enforce** 的字段来配置当前 rule 的 loader 类型：

1. pre 前置类型
2. post 后置类型

还有一种**行内 Loader**，即在应用代码中直接声明使用的 loader，如

```js
const json = require('json-loader!./file.json');
```

不建议行内 loader 的开发方式

总结：所有的 loader 按照 前置->行内->普通->后置的顺序执行

### noParse

loader 是在 module.rules 下配置的，用于控制处理不用的模块，还有 module.noParse 字段，用于配置哪些文件不需要解析，对于不需要解析依赖(即无依赖)的第三方大库类型，通过这个字段配置提高整体的构建速度

使用 noParse 进行忽略的模块不能使用 import、require、define 等导入机制

```js
module.exports = {
  module: {
    noParse: /jquery|lodash/,

    // 或者使用function
    noParse(content) {
      return /jquery|lodash/.test(content);
    },
  },
};
```

## 路径解析

webpack 中有一个关键的模块，enhanced-resolve，就是处理依赖模块路径解析的

### 解析相对路径的流程

1. 查找相对当前模块的路径下是否有对应文件或文件夹
2. 是文件则直接加载
3. 是文件夹则继续查找文件夹下的 package.json 文件
4. 有 package.json 文件则按照文件 main 字段的文件名查找文件
5. 无 package.json 或者无 main 字段则查找 index.js 文件

### resolve

在 webpack 配置中，和模块路径解析相关的配置都在 resolve 字段下

```js
module.exports = {
  resolve: {},
};
```

#### resolve.alias

需要经常引用的模块，可以配置在 resolve.alias

```js
alias: {
  utils: path.resolve(__dirname, 'src/utils');
}
```

#### resolve.extensions

webpack 会自行补全文件后缀，而这个补全的行为，是可以配置的

```js
extensions: ['.js', '.json', '.jsx', '.css'];
```

#### resolve.modules

对于直接声明依赖名的模块，webpack 会类似 node.js 一样进行路径搜索，搜索 node_modules 目录，这个目录就是使用 resolve.modules 进行配置的

#### resolve.mainFiles

有 package.json 文件则按照文件中 main 字段的文件名查找文件

以上是默认的相对路径查找规则，实际上 webpack 的 resolve.mainFiles 配置可以调整。当引用一个模块或者目录时，会**使用 package.json 文件的哪一个字段指定的文件**，默认配置是这样的：

```js
resolve: {
  // 配置target === 'web' 或者 target==='webworker'是 mainFiles默认配置是：
  mainFiles: ['browser', 'module', 'main'],

  // targer的值是其他时，mainFiles默认值为：
  mainFiles:['modules','main']
}
```

因为通常情况下，模块的 package 都不会声明 browser 或 module 字段，所以便是使用 main 了。

在 NPM packages 中，会有些 package 提供了两个实现，分别给浏览器和 Node.js 两个不同的运行时使用，这个时候就需要区分不同的实现入口在哪里

#### resolve.mainFiles

无 package.json 或者无 main 字段则查找 index.js 文件

这个也是可以配置的，使用 resolve.mainFiles 字段，默认配置是：

```js
resolve: {
  mainFiles: ['index']; //可以添加其他默认使用的文件名
}
```

通常无需修改，约定俗称的

#### resolve.resolveLoader

用于配置解析 loader 时 resole 配置，原本 resolve 的配置项在这个字段下基本都有
