---
title: 23 - [视频]Python 通用的调度平台设计及难点讲解
date: 2020-06-18 15:27:34
permalink: /pages/09c77c/
categories:
  - Python 实战：用 Scrapyd 打造个人化的爬虫部署管理控制台
tags:
  - 
---
# \[视频\]Python 通用的调度平台设计及难点讲解

之前的学习基于 Scrapyd，这意味着我们造出来的平台只能调度 Scrapy 框架编写的爬虫项目。如果想要将 Requests 库或者原生 Python 编写的项目，那就需要设计一套新的调度平台。

## 通用调度平台功能要点

要想实现通用的 Python 项目调度功能，需要了解和解决以下几个问题：

*   Python EGG 概念及基本知识
*   Scrapyd 对项目的部署和调度逻辑
*   Python 进程协议
*   Python 子进程交互
*   Python EGG 打包
*   多机通信

## 观看视频

笔者于 2019 年 5 月 22 日在华为云社区开启了一场主题为 [45 分钟掌握 PYTHON 项目部署与核心调度逻辑](http://huaweicloud.bugu.mudu.tv/watch/vondje76) 的直播，直播中介绍了通用调度平台的功能要点和具体的实现方法。对此感兴趣的读者可以前往观看。

直播部分截图如下：

![](https://user-gold-cdn.xitu.io/2019/6/25/16b8df2888244083?w=959&h=437&f=png&s=104996)

![](https://user-gold-cdn.xitu.io/2019/6/25/16b8df2e101f8e13?w=931&h=353&f=png&s=204588)

![](https://user-gold-cdn.xitu.io/2019/6/25/16b8df32d817d24e?w=945&h=489&f=png&s=193186)

![](https://user-gold-cdn.xitu.io/2019/6/25/16b8df3ed49e3fb2?w=982&h=539&f=png&s=233928)