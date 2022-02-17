---
title: 7 - 学了就用处处行 ───   启动一个最简单的 GraphQL API 服务器【基础】
date: 2020-06-18 15:23:04
permalink: /pages/71abc9/
categories:
  - 基于 NodeJS 构建 GraphQL API 服务
tags:
  - 
---
# 启动一个最简单的 GraphQL API服务器

在上一小节中我们创建了基础的 egg.js 项目并引入了第三方包 graphql，在本小结中我将带领大家启动 egg 项目并学习 grophql 的使用。

## 一个简单的 GraphQL API

### 编写 hello 业务 [章节源码](https://user-gold-cdn.xitu.io/2020/6/5/172833db254f0321)

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a6b185f8948f?w=296&h=117&f=png&s=5627)

### schema.graphql

graphql 自带一组默认标量类型，包括 `Int`，`Float`，`String`，`Boolean`，`ID`。在定义字段时需要注明类型，这也是 graphql 的特点之一，是支持强类型的。如果非空，就在类型后面跟上一个!号。graphql 还包括枚举类型，列表和自定义类型。

```
type Hello {
  id: ID!
  name: String!
}

```

### connector

编写完 `schema` 之后，graphql 知道有哪些数据了，但他还需要知道 **“如何去取”**， `connector` 的角色就在于此。 `connector` 的职责就是 “取数”， 他既可以调用 rpc 接口取数，又可以调用内置的 orm 插件去取数，还可以直接调用 egg 的 `service`。

```
export default class HelloConnector {
  hellos() {
    return [
      {
        id: 1,
        name: 'Jack',
      },
      {
        id: 2,
        name: 'Lucy',
      },
    ];
  }
}


```

### resolver

resolve.js是数据类型的具体实现，依赖connector.js完成。其实 resolver 非常简单，就是针对你暴露的查询接口，调用相应的connector去取数即可，如下：

```
export default {
  Query: {
    hellos(_root: any, {}, { connector }) {
      return connector.hello.hellos();
    },
  },
};

```

### 定义 `Query`

新建一个 `query` 目录创建 `schema.graphql` 文件，大家也可以直接在各个模块下的 `schema.graphql` 文件中定义，纯属个人习惯

```
type Query {
  hellos: [Hello!]
}

```

> \[Hello!\] 可以理解为 \[{id: 1, name: 'jack'}, {id: 2, name: 'praise'}\] Hello! 可以理解为 {id: 1, name: 'jack'}

### 项目启动

egg本地开发环境启动方式非常简单：

```
$ npm run dev

```

我们在浏览器中输入 `http://127.0.0.1:7001/graphql` 是类似下面这种界面说明已经 `graphql` 服务已经跑起来了。这是 `graphql` 自带的开发者工具页面，这个开发者工具可以满足我们绝大部分的调试工作，很是方便。

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a6acc0ce8108?w=1909&h=861&f=png&s=54676)

### 完成一次查询

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a6b66d2d0f5b?w=1839&h=592&f=png&s=32657)

结果的顺序也是按照你输入的顺序排序的，定制化的数据，完全根据你查什么返回什么结果。这就是 `GraphQL` 被称作 `API` 查询语言的原因。

如果你对返回的名称不满意，还可以设置别名：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a6bab15763a0?w=1886&h=614&f=png&s=37995)

### 请求流程

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a75466a5aa41?w=1039&h=214&f=png&s=8484)

通过上方的例子我们可以看出客户端发送请求会被 `graphql` 解析，根据映射关系找到对应的 `resolver`。路由将数据传递到对应的 `resolver`，`resolver` 去调用对应的 `connector` 进行处理，`connector` 再调用 `service` 进行数据库处理。

## 小结

在这一节中我们学习了如何启动项目，以及通过一个例子串联了一个graphql 的请求流程是怎样的，下一节我们将正式进入实战环节。