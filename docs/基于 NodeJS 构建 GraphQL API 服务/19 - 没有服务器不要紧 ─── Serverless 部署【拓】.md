---
title: 19 - 没有服务器不要紧 ─── Serverless 部署【拓】
date: 2020-06-18 15:23:04
permalink: /pages/a7ddaa/
categories:
  - 基于 NodeJS 构建 GraphQL API 服务
tags:
  - 
---
# Serverless 部署

[Serverless](https://serverless.com/) 中文称之为无服务器，并不是说没有服务器，而是说服务器对用户来说是透明的。它使用计算托管的方式，在 `Serverless` 这里，我们可以看成两块，第一块就是函数即服务，它真正实现了你业务的托管计算。另外一种是后端即服务，包括对象存储，大家不用自己构建分布式存储，不用担心数据的丢失和安全性问题；同时在云上提供的数据库，消息队列和对象存储都是一样的，不用购买服务器自己搭建，在购买使用的过程当中我们可以称之为 `Serverless`。因为这些都是托管型的，使用的时候不用关心它的安全性，不用关心可能服务器宕机导致的故障。

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ae0a1a571aa6?w=1031&h=474&f=png&s=25673)

FaaS（Function as a Service） 就是一些运行函数的平台，比如阿里云的函数计算、AWS 的 Lambda 等。

BaaS（Backend as a Service）则是一些后端云服务，比如云数据库、对象存储、消息队列等。利用 BaaS，可以极大简化我们的应用开发难度。

## 传统开发流程 VS Serverless 开发流程

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ae4cbdbe13a7?w=896&h=214&f=png&s=14240)

在传统开发流程中，我们需要前端写页面，后端工程师写接口。后端写完接口之后，把接口部署了，再进行前后端联调。联调完毕后再测试、上线。上线之后，还需要运维工程师对系统进行维护。整个过程涉及多个不同角色，链路较长，沟通协调也是一个问题。

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ae50228337c9?w=888&h=172&f=png&s=7895)

而基于 `Serverless`，后端变得非常简单了，以往的后端应用被拆分为一个个函数，只需要写完函数并部署到 `Serverless` 服务即可，后续也不用关心任何服务器的运维操作。

## 搞懂 Serverless 四大特点

### 自动扩缩容

函数即应用，一个函数只做一件事，可以独立的进行扩缩容，而不用担心影响其他函数，并且由于粒度更小，扩缩容速度也更快。而对于单体应用和微服务，借助于各种容器编排技术，虽然也能实现自动扩缩容，但由于粒度关系，相比函数，始终会存在一定的资源浪费。比如一个微服务提供两个 API，其中一个 API 需要进行扩容，而另一个并不需要，那么这时候扩容，对于不需要的 API 就是一种浪费。

### 事件驱动

函数本质上实现的是一种[IPO](https://en.wikipedia.org/wiki/IPO_model)（Input-Process-Output）模型，它是短暂的，是即用即走的。既不发布任何服务，没有请求时也不消耗任何资源，只有当请求来了，才会消耗资源进行响应，服务完立刻释放资源。正是由于这一点，函数天然的适用于任何事件驱动的业务场景，比如身份验证，定时任务，图片处理等。

### 运行成本

无论是过去的 IDC 还是现在的云主机，本质上都是一种包月计费模式，也就是说，不管有没有用户访问你的应用，也不管你有没有部署应用，你都要付相同的钱。而对于 `Serverless` 应用是根据实际使用量来进行付费的，用多少付多少。而在运维过程中，用户无须再持续监控和维护具体服务器的状态，只需要关心应用的整体状态。应用运营的整体复杂度下降，用户的关注点可以更多地放在软件应用的体验和改进以及其他能带来更高业务价值的地方。

### 无状态性

在 `Serverless` 架构下，应用的功能被解构成若干个细颗粒度的无状态函数，功能与功能之间的边界变得更加清晰，功能模块之间的耦合度大大减小。这使得软件应用的开发效率更高，应用开发的迭代周期更短。无状态一方面有助于提高函数的可重用性和可迁移性，但也带来了性能上的一些损失。函数不是常驻进程，每一个请求，函数都要经历一次冷启动。每服务完一个请求，函数的进程会被杀掉，也就是说使用内存进行缓存对函数而言没有意义。每次启动都可能被调度到新的服务器上，任何基于本地磁盘的缓存技术也不再适用。

## 准备

使用 `Serverless` 在几分钟内就可以创建和部署一个无服务器微服务，接下来我们就来拿我们的项目来做实践。

### 安装插件

通过 NPM 全局安装 [Serverless Framework](https://www.github.com/serverless/serverless)

```
$ npm install -g serverless

```

### 修改 Egg 配置

由于云函数在执行时，只有 `/tmp` 可读写的，所以我们需要将 `egg.js` 框架运行尝试的日志写到该目录下，为此需要修改 `config/config.default.ts` 中的配置如下

```
const config = {
    env: 'prod',  // 推荐云函数的 egg 运行环境变量修改为 prod
    rundir: '/tmp',
    logger: {
      dir: '/tmp',
    },
  } as PowerPartial<EggAppConfig>;

```

### 构建为 JS

egg.js 的文档上有句话：正式环境下，我们更倾向于把 `ts` 构建为 `js`。等于说我们在服务器里面运行之前，需要将 `ts` 都转换为 `js`，这样才能正常运行。看看 `package.json`，里面有对应的命令。

```
$ npm run ci

```

当有同名的 `ts` 和 `js` 文件时，egg 会优先加载 `js` 文件。

### serverless.yml

在项目目录下，创建 `serverless.yml` 文件，在其中进行如下配置

```
# Serverless.yml

egg:
  component: "@Serverless/tencent-egg"  # NPM 包名称
  inputs:
    region: ap-guangzhou				# 地区 默认为：ap-guangzhou
    functionName: egg-graphql-function  # 函数名称
    code: ./							# 工作目录
    functionConf:						# 功能配置
      timeout: 10						# 允许执行的功能的持续时间
      memorySize: 128					# 执行期间该功能可用的内存大小
      environment:						# 功能的环境变量
        variables:						# 环境变量数组
          TEST: vale
    apigatewayConf:						# API网关配置
      protocol: https					# 服务的前端请求类型，例如HTTP，HTTPS，HTTP和HTTPS
      environment: release 				# 要发布的环境的名称。支持三种环境: test, prepub 和 release

```

## 开始部署

通过 **serverless** `or` **sls** 命令进行部署，并可以添加 `--debug` 参数查看部署过程中的信息。

```
$ serverless --debug
# or
$ sls --debug

```

如您的账号未 [登陆](https://cloud.tencent.com/login) 或 [注册](https://cloud.tencent.com/register) 腾讯云，您可以直接通过 `微信` 扫描命令行中的二维码进行授权登陆和注册。

部署成功后，可以直接在访问日志中返回的 url 地址，查看本次部署的效果。

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ae66251f926d?w=872&h=197&f=png&s=19658)

打开这个 url 我们看到我们的项目已经部署上去并且可以正常使用。

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ae6341cc1ab3?w=1910&h=421&f=png&s=85343)

### 账号配置

当前默认支持 CLI 扫描二维码登录，如您希望配置持久的环境变量/秘钥信息，也可以本地创建 `.env` 文件

```
$ touch .env # 腾讯云的配置信息

```

如果已有腾讯云账号，可以在 [API 密钥管理](https://console.cloud.tencent.com/cam/capi) 中获取 `SecretId` 和`SecretKey`

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ae5eaa1d7bec?w=1920&h=662&f=png&s=82648)

在 `.env` 文件中配置腾讯云的 SecretId 和 SecretKey 信息并保存

```
TENCENT_SECRET_ID=SecretId
TENCENT_SECRET_KEY=SecretKey

```

### 移除部署

通过以下命令移除部署的 API 网关，并可以添加 `--debug` 参数查看移除部署过程中的信息。

```
$ serverless remove --debug
# or
$ sls remove --debug

```

## 小结

通过本篇的学习我们知道使用 `Serverless` 时，我们不需要再过多关注服务端的运维，不需要关心我们不熟悉的领域，我们只需要专注于业务的开发、专注于产品的实现。我们需要关心的事情变少了，但我们能做的事情更多了。