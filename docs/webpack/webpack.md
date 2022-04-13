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
