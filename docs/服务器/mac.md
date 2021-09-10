---
title: mac
date: 2021-09-10 10:14:25
permalink: /pages/cff47a/
categories:
  - 服务器
tags:
  -
---

## mac 下全局安装不需要 sudo

```
sudo chown -R $(whoami) /usr/local
```

把/use/local 的 owner 換成自己，就有 write 權限了

whoami 就是一個命令，會 echo 當前登錄用戶的名字。當然你知道自己的用戶名，比如 jack,就直接

```
sudo chown -R jack /usr/local
```

修改权限之后，就可以不需要 sudo 安装了，因为当前用户已经拥有写入权限/usr/local 了

然后用

```
ls -ld /usr/local
```

确认目录的 owner 是否有当前用户的名字
