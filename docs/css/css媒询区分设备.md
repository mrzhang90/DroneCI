---
title: css媒询区分设备
date: 2021-11-01 10:43:52
permalink: /pages/bd31dd/
categories:
  - css
tags:
  -
---

iphone<5:

```
@media screen and (device-aspect-ratio: 2/3) {}
```

iphone 5:

```
@media screen and (device-aspect-ratio: 40/71) {}
```

iPhone 6:

```
@media screen and (device-aspect-ratio: 667/375) {}
```

iPhone 6Plus:

```
@media screen and (device-aspect-ratio: 16/9) {}
```

iPad 竖屏:

```
@media screen and (device-aspect-ratio: 3/4) {}
```

## 参考

[iPhone CSS media query（媒体查询）](https://www.bbsmax.com/A/B0zqBBbnJv/)
