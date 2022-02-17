---
title: 17 - 跨域身份验证 ─── JWT 权限验证【拓】
date: 2020-06-18 15:23:04
permalink: /pages/51ce91/
categories:
  - 基于 NodeJS 构建 GraphQL API 服务
tags:
  - 
---
# JWT 权限验证

关于接口的安全验证方案有很多，比如：session、签名验证、JWT 等，由于我们在前面的实战环节中已经使用过一种方式来实现权限验证了，所以本篇我们把 JWT 作为一个扩展来讲解。

## 关于 JWT

JWT 全称 JSON Web Token，是目前比较流行的另一种跨域身份验证解决方案。也是被很多人用坏的一种安全验证机制。

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ad74c1c6c3a0?w=1019&h=224&f=png&s=9460)

JWT 的原理是在服务器身份验证之后，将生成一个 `json` 对象并将其发送回用户， 如下：

```
{
  "id": "1",
  "username": "Praise",
  "expire": "2018-08-08 20:15:56"
}

```

服务器与客户端通信就是以发送这个 `json` 对象来实现的，为了防止客户端去篡改通信使用的 `json` 对象，服务器会在生成这个对象的时候，为这个 `json` 对象加上一个签名。

## JWT 结构

服务器返回的token数据基本结构是 `Header.Payload.Signature`， `header`、`payload`、`signature` 三部分以 `'.'` 隔开：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJ1c2VyTmFtZSI6ImNlc2hpemhhbmdodTAyIiwiaWF0IjoxNTU1MjEyMzg1LCJleHAiOjE1NTUyMTU5ODV9.
K53kd6cERhp6H4mtd8jCzA2bQtJTsdA2Kh3hzbXMXbU

```

*   `header`: 一个 json 对象，描述 jwt 的元数据。
*   `payload`: 一个 json 对象，用来存放实际需要传递的数据。
*   `signature`: 对 header和 payload 两部分的签名，防止数据被篡改。

### JWT 的交互方法

客户端接收服务器返回的 `JWT`，将其存储在`Cookie` 或 `localStorage` 中。此后，客户端将在与服务器交互中都会带 JWT。如果将它存储在 Cookie中，就可以自动发送，但是不会跨域，因此一般是将它放入HTTP请求`Header Authorization`字段中。

## 使用 JWT

前面我们简单介绍了 JWT 的原理以及结构，接下来我们在项目中使用 JWT 来实现权限验证。

### 安装插件

`jwt` 的插件有很多，在这里我就不为大家介绍了，我选了个下载量最多的 [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)，只是使用方式不同，原理都相同，大家也可以使用其他插件进行尝试。

```
$ npm install jsonwebtoken --save

```

### 生成 Token

**jwt.sign(payload, secretOrPrivateKey, \[options, callback\])**

*   `secretOrPrivateKey` 是一个字符串，缓冲区或对象，其中包含 `HMAC` 算法的密钥或 `RSA 和`ECDSA`的`PEM\` 编码的私钥。如果使用带有密码短语的私钥，则可以使用对象{key，passphrase}（基于加密文档），在这种情况下，请确保您通过了algorithm选项。
*   `options`
    *   `algorithm` (默认算法: `HS256`)。
    *   `expiresIn`：以秒或表示时间跨度zeit / ms的字符串表示。
    *   ...

```
// 对用户信息进行签名生成token
const token = JWT.sign({
    id: 1,
    username: 'priase',
}, 'private.key', { expiresIn: 60 });

console.log(token) // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJwcmlhc2UiLCJpYXQiOjE1Nzc0Mzg4OTksImV4cCI6MTU3NzQzODk1OX0.JO2IIAXQfVigHxaIFmwIIUI6gGKR-pwC6XNRQijR_Gc

```

### 验证 Token

验证 `token` 非常简单，只需要一句话：

```
const verify = JWT.verify(token, 'private.key');

```

验证结果：

```
{
    "id": 1,
    "username": "priase",
    "iat": 1577438899,
    "exp": 1577438959
}

```

## 关于JWT的一些问题

`JWT` 的最大缺点是服务器不保存会话状态，所以在使用期间不可能取消令牌或更改令牌的权限。也就是说，一旦`JWT` 签发，在有效期内将会一直有效，这也是我在实战环节中没有用 `JWT` 的原因，不过技术无好坏，一切还是看需求来定。

`JWT` 本身包含认证信息，因此一旦信息泄露，任何人都可以获得令牌的所有权限。为了减少盗用，`JWT` 的有效期不宜设置太长。对于某些重要操作，用户在使用时应该每次都进行进行身份验证。

## 课外练习

我们讲完了 JWT，小伙伴们也要动起手来啊：

*   在我们的项目中使用 JWT
*   还有 JWT最大的缺点，该怎么解决
*   添加 JWT 的中间件验证

...