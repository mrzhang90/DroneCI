---
title: 3 - 开局必备 ───  TypeScript 基础知识【基础】
date: 2020-06-18 15:23:04
permalink: /pages/5d2af6/
categories:
  - 基于 NodeJS 构建 GraphQL API 服务
tags:
  - 
---
# TypeScript 开发基础知识

因为后续我们的实战中是使用Typescript来编写的，我们先来了解一波。TypeScript 是 JavaScript 的类型的超集，它可以编译成纯 JavaScript。编译出来的 JavaScript 可以运行在任何浏览器上。TypeScript 编译工具可以运行在任何服务器和任何系统上。TypeScript 是开源的。

## 为什么要拥抱 TypeScript

如今，无论你是一枚前端开发还是后端开发，要是你连 JavaScript 都不知道，那你真的是 out 了。学习 JavaScript 是一件很有必要的事情。随着 Node.js 越发的流行， JavaScript 这门语言已经随处可见。众所周知 JavaScript 的语法规则不是那么严谨，随着项目的迭代与复杂度的不断增加，管理 JavaScript 项目也越发的困难了。正是因为这，TypeScipt 走进每一名开发者的视野。它的到来不禁让我们在平时的开发上避免了一些不必要的错误，更是使项目变的更加容易维护和迭代。

## TypeScript VS JavaScript

在上面我们已经介绍了 TypeScript 是 JavaScript 的一个超集，那他们之间到底有什么区别？让我们来看这张关系图：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708a602752189f3?w=561&h=472&f=png&s=58424)

ES5，ES6 涵盖了 ES5 并扩充了类与模块，ES7 覆盖了 ES6 并扩充了 `async/awaitc` 和装饰器

### JavaScript

JavaScript 是一门轻量级解释型脚本语言，可以嵌入到 HTML 页面中，在浏览器端执行，实现浏览器端丰富的交换功能，为用户带来流畅的用户体验，它是基于对象和事件驱动的，无需特定的语言环境，只需要在支持的浏览器上就可以运行。

特点：

*   脚本语言，无需编译
*   基于对象的语言，创建对象同时使用现有对象
*   语法简单（弱类型语言）
*   动态性（事件驱动）
*   兼容性好（能够与其他技术一起是使用）
*   仅依赖与浏览器（跨平台语言）

JavaScript 可谓说是神一样的语言，论灵活性没有那个语言可以与之一争高下。但由于如此高的灵活性，大神和菜鸟的 code 风格与质量肯定是不可苟同。在任何 IDE 编译下都不会报错，看似很爽。但是在运行时，错误漫天飞的 JavaScript 是不是让你内心崩溃啊。

### TypeScript

TypeScript 包含了 JavaScript 的所有元素，可以载入 JavaScript 的代码运行，并扩展了 JavaScript 的语法。

特点：

*   静态类型、类、模块、接口和类型注解
    
*   代码的可读性和可维护性
    
*   IDE 的支持
    
*   完全的面向对象
    
*   可以在编译阶段就发现大部分错误
    
*   重构相比 JavaScript 要简单很多
    

TypeScript 在学习难度上虽然高于 JavaScript 但它带来的好处也是相应的，如果你有着 JavaScript 的开发经验，相信你可以快速上手 TypeScript 的。在 TypeScript 中你可以使用 JavaScript 的所有代码概念 。

## TypeScript 显著的优势

### 静态类型

快速定位错误和修复错误是每一位开发人员所必须要掌握的技能，而 TypeScript 的静态类型让我们在编写脚本的同时检验错误，避免不必要的 bug 。这让我们可以编写更加健壮的代码进行维护，以便使我们的代码质量更好更清晰。

### 生产力

TypeScript 继承了 ECMAScript 6的大部分语法，因此你不必重新学习它。自动完成和动态输入等因素有助于提高开发人员的工作效率

### 项目的迭代

无论是什么项目，随着客户的需求和技术的更新。不断的迭代是避免不了的，而我们有时为了改进项目，需要对代码进行小的更改。由于我们的更改，可能引发的后果可能是我们意想不到的，因此我们必须撤销这些操作。但使用 TypeScript 工具来重构就会变得便捷。

### 协作能力

JavaScript 是弱类型并且没有命名空间，导致很难模块化，使得其在大型的协作项目中不是很方便。多人协作时乱码和错误的机会也在增加，而 TypeScript 可以很好的避免这一点。同时 TypeScript 的类型安全是一种在编码期间就可以检测错误的功能，而不是在编译期间检测错误。这为团队创建了一个更高效的编码和测试条件。

## JavaScript 和 TypeScript 如何抉择 ？

在上面我为大家介绍了 TypeScript 的优势点，但并没有提及 JavaScript 有哪些优势。不是因为没有，只是因为我们今天的重点在 TypeScript。技术没有好坏，该如何选择还是看项目的需要。如果是大型项目，TypeScript 的优势是比 JavaScript 的权重要高的，反之如果是小型项目，那么灵活的 JavaScript 无疑是更好的选择。

## 小结

本节从TypeScript 是什么说起，依次介绍了为什么要学习 TypeScript、TypeScript 与 JavaScript 的对比、TypeScript 明显的优势、JavaScript 和 TypeScript 如何抉择相关的基础知识，内容由浅到深，全面地帮助大家了解TypeScript。