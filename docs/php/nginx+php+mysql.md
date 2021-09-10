---
title: Nginx + PHP + MySql
date: 2021-09-10 11:08:39
permalink: /pages/4bb668/
categories:
  - php
tags:
  -
---

### 安装 XAMPP

简单模式，安装集成环境，就不需要在单独安装 nginx、php、mysql 啦
https://www.apachefriends.org/download_success.html

### 安装 mysql

https://dev.mysql.com/downloads/mysql/

版本选择 DMG Archive，傻瓜式安装即可，最后要输入一个复杂密码(用户连接数据库的密码)，一定记住密码

安装完成后，点击系统偏好设置，选择 MySql，开启服务

想在终端直接使用 Mysql 命令，需要配置

```
vim .bash_profile
  # 配置mysql路径
  export PATH=${PATH}:/usr/local/mysql/bin
  # 配置mysql别名，这样配置就可以使用mysql命令
  alias mysql='/usr/local/mysql/bin/mysql'
  # 配置mysqladmin别名
  alias mysqladmin='/usr/local/mysql/bin/mysqladmin'
```

让文件生效

```
source .bash_profile
```

在终端输入 mysql -V,显示 mysql 版本信息，表示路径配置成功

```
mysql -V
```

连接数据库

```
#因为设置了别名可以直接用mysql，否则要/usr/local/mysql/bin/mysql -u root -p
mysql -u root -p
```

退出时，用 exit

### 配置 PHP

```
# mac 默认支持 php 的，输入 php -v，显示版本信息，表示 php 已存在，简单配置一下即可
php -v
```

1. 新建 php-fpm.conf 文件

```
sudo cp /private/etc/php-fpm.conf.default /private/etc/php-fpm.conf
```

2. 编辑 php-fpm 文件，修改 error_log 路径

```
error_log = /usr/local/var/log/php-fpm.log
```

否则 php-fpm 时会报错

```
ERROR: failed to open error_log (/usr/var/log/php-fpm.log): No such file or directory (2)
```

3. 进入 PHP 安装目录/etc/php-fpm.d

```
cp www.conf.default www.conf
```

否则会报错

```
php-fpm ERROR: No pool defined. at least one pool section must be specified in config file
```

4. 启动 php-fpm

```
sudo php-fpm
```

5. php-fpm 比较坑，没有重启，当修改配置，需要手动 kill

```
# 查看php进程
ps aux | grep php
# 查看9000端口占用情况
sudo lsof -i :9000
# 干掉PID
sudo kill -9 1770
```

## 参考

[详解 nginx、php-fpm 和 mysql 用户权限](https://www.cnblogs.com/lamp01/p/9347822.html)
