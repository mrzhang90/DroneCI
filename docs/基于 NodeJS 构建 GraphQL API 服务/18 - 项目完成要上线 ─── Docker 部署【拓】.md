---
title: 18 - 项目完成要上线 ─── Docker 部署【拓】
date: 2020-06-18 15:23:04
permalink: /pages/824b01/
categories:
  - 基于 NodeJS 构建 GraphQL API 服务
tags:
  - 
---
# Docker 部署

这一篇我将带大家如何使用 Docker 部署项目到线上。Docker 可理解为跑在宿主机上的非常精简、小巧、高度浓缩的虚拟机。 它可以将容器里的进程安稳的在宿主机上运行。

## 开始前的准备

> docker 与 docker-compose 的安装我就不给大家介绍了。作为一位开发人员，我认为这点事情难不倒大家。

### 创建需要的文件

我们需要在项目根目录创建我们所需要的文件

```
$ touch Dockerfile
$ touch docker-compose.yml
$ setup.sh

```

### 目录结构

```
egg-project
├── package.json
├── setup.sh (新建)
├── Dockerfile (新建)
├── docker-compose.yml (新建)
├── app
...


```

### 常用指令

在开始之前我们要学习下常用的一些指令，看下方：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ad8bbb2b70d0?w=973&h=396&f=png&s=328106)

### 部署流程

这是一个项目的部署流程，这篇文章带大家做一个简单的部署。后面大家可以参照这张流程图来做一些完善。

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ad98784e2ef8?w=992&h=658&f=png&s=216608)

## 安装 Jenkins

既然我们项目部署打算使用 Docker，那么在安装 `Jenkins` 我们也一样选择使用 Docker三剑客之一的 `docker-compose`。docker-compose 是一个用来把 docker 自动化的东西，有了 docker-compose 你可以把所有繁复的 docker 操作全都一条命令，自动化的完成。

### 创建目录

首先我们需要在服务器上创建一个目录机构 ：

```
/home/jenkins
     - docker-compose.yml
     - jenkins-home

```

### 编写docker-compose.yml

接下来我们来编写 `docker-compose.yml` 安装 `Jenkins`:

```
version: '3'                                    # 指定 docker-compose.yml 文件的写法格式
services:                                       # 多个容器集合
  docker_jenkins: 
    user: root                                  # 为了避免一些权限问题 在这我使用了root
    restart: always                             # 重启方式
    image: jenkins/jenkins:lts                  # 指定服务所使用的镜像 在这里我选择了 LTS (长期支持)
    container_name: jenkins                     # 容器名称
    ports:                                      # 对外暴露的端口定义
      - '8080:8080'
      - '50000:50000'
    volumes:                                    # 卷挂载路径
      - /home/jenkins/jenkins_home/:/var/jenkins_home   # 这是我们一开始创建的目录挂载到容器内的jenkins_home目录
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker                 # 这是为了我们可以在容器内使用docker命令
      - /usr/local/bin/docker-compose:/usr/local/bin/docker-compose     # 同样的这是为了使用docker-compose命令

```

我们需要进入到 jenkins 目录执行以下指令：

```
$ docker-compose up -d

```

到这里 `Jenkins` 就安装成功了，使用 `docker-compose` 是不是既方便又快捷，接下来我们来配置以下 `Jenkins`。

### 配置

不出意外你现在可以打开你的服务器地址 [http://xxxxxxx](http://xxxxxxx): 端口号 就能看到这个界面：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ad9d6f3d9b36?w=990&h=582&f=png&s=113768)

打开服务器你所创建的 `jenkins` 目录进入到 `jenkins-home`  
`/home/jenkins/jenkins-home`：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708ada1b882e188?w=996&h=128&f=png&s=58185)

进入 `secrets` 目录：

```
$ cat initialAdminPassword

```

![](https://user-gold-cdn.xitu.io/2019/7/23/16c1d97fed386f9f?w=409&h=36&f=png&s=19986)

然后把里面的文本复制出来填到管理员密码中。

在这里我们直接安装推荐的插件就好了：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708adae63707a40?w=976&h=484&f=png&s=122078)

创建管理员用户：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708adb3018f0ec5?w=926&h=425&f=png&s=50809)

进入到首页面后，我们需要安装这两个插件 ：

```
NodeJS Plugin
Publish Over SSH

```

![](https://user-gold-cdn.xitu.io/2020/2/28/1708adb751e90116?w=1043&h=541&f=png&s=164037)

配置 NodeJS 版本：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708adbad3b752dd?w=1021&h=537&f=png&s=172021)

滑到最下方配置：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708adc07598f426?w=1067&h=713&f=png&s=105257)

配置 `SSH`：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708adc463939995?w=1081&h=672&f=png&s=130183)

## 编写 Docker 文件

### Dockerfile

我们在开始阶段的时候学过一些常用指令，大家应该一眼就可以看得懂这些命令。 加油！！

```
FROM node:10.0-alpine             # 镜像版本

# 设置时区
RUN apk --update add tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

# 创建app目录
RUN mkdir -p /usr/src/node-app/egg-santak

# 设置工作目录
WORKDIR /usr/src/node-app/egg-santak

# 拷贝package.json文件到工作目录
# !!重要：package.json需要单独添加。
# Docker在构建镜像的时候，是一层一层构建的，仅当这一层有变化时，重新构建对应的层。
# 如果package.json和源代码一起添加到镜像，则每次修改源码都需要重新安装npm模块，这样木有必要。
# 所以，正确的顺序是: 添加package.json；安装npm模块；添加源代码。
COPY package.json /usr/src/node-app/egg-santak/package.json

# 安装npm依赖(使用淘宝的镜像源)
# 如果使用的境外服务器，无需使用淘宝的镜像源，即改为`RUN npm i`。
RUN npm i --registry=https://registry.npm.taobao.org

# 拷贝所有源代码到工作目录
COPY . /usr/src/node-app/egg-santak

# 暴露容器端口
EXPOSE 7001

# 启动node应用
CMD npm start

```

### 创建目录

我们这个项目中使用了 `mysql` 和 `redis` 我们需要创建数据卷用来保证数据持久化：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708adc8d6aa7967?w=594&h=77&f=png&s=25505)

```
# nginx
$ mkdir -p nginx/conf.d nginx/logs

# mysql
$ mkdir mysql

# redis
$ mkdir redis

```

然后进入 `nginx/conf.d` 文件夹中 创建一个后缀为 `conf` 的文件：

```
$ cd nginx/conf.d
$ touch default.conf
$ vim default.conf

```

写入以下内容：

```
server {
  listen 80;
  listen [::]:80;
  server_tokens off;

  root /var/www/html;
  index index.html index.htm;

  # 修改为自己的域名
  server_name api.lovelp.xin;

  # 访问 / 路径时执行反向代理
  location / {
    # 这里 nodejs 是 node 容器名
    proxy_pass http://nodejs:7001;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
    # 后端的Web服务器可以通过 X-Forwarded-For 获取用户真实 IP
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    # 允许客户端请求的最大单文件字节数
    client_max_body_size 15M;
    # 缓冲区代理缓冲用户端请求的最大字节数
    client_body_buffer_size 128k;
  }
}

```

### docker-compose.yml

我们使用 `docker-compose.yml` 来对多个 Docker 容器编排：

```
version: '3' # 指的是docker-compose的 version

services:
  example_redis:
    image: redis:3                  # 指定服务镜像
    container_name: santak_redis    # 容器名称
    restart: always                 # 重启方式
    hostname: redis
    command: redis-server /usr/local/etc/redis/redis.conf --requirepass 123456  --appendonly yes
    volumes:                        # 挂载数据卷
      - /root/redis/redis.conf:/usr/local/etc/redis/redis.conf
    ports:                          # 映射端口
      - "6379:6379"     
    networks:                       # 加入指定网络
      - app-network

  example_nginx:
    image: nginx:stable-alpine      # 指定服务镜像
    container_name: santak_nginx    # 容器名称
    restart: always                 # 重启方式
    ports:                          # 映射端口
      - "80:80"
    volumes:                        # 挂载数据卷
      - /etc/localtime:/etc/localtime
      - /root/nginx/conf.d:/etc/nginx/conf.d
      - /root/nginx/logs:/var/log/nginx
    depends_on:                     # 启动顺序
      - nodejs
    networks:                       # 加入指定网络
      - app-network

  example_mysql:
    image: mysql:5.7
    container_name: santak_mysql
    restart: always
    ports:                          # 映射端口
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_USER=lovelp           # 创建lovelp用户
      - MYSQL_PASSWORD=mm123321     # 设置lovelp用户的密码
      - MYSQL_DATABASE=santak       # 创建初始数据库
      - TZ=Asia/Shanghai            # 设置时区
    volumes:                        # 挂载数据卷
      - /root/mysql:/var/lib/mysql  # 为了数据持久化
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    networks:                       # 加入指定网络
      - app-network 

  nodejs:
    build:                          # 这里指的是我们刚刚撸的 Dockerfile 文件
      context: .                    
      dockerfile: Dockerfile
    image: nodejs                   # 镜像名称
    container_name: nodejs          # 容器名称
    restart: always                 # 重启方式
    depends_on:                     # 启动顺序
      - santak_redis
      - santak_mysql
    links:                          # 容器连接
      - santak_redis:santak_redis
      - santak_mysql:santak_mysql
    networks:                       # 加入指定网络
      - app-network

volumes:
  certbot-etc:
  certbot-var:

networks:  # 实现通信
  app-network:
    driver: bridge

```

### 脚本

这是我们部署时所要执行的脚本任务：

```
#!/usr/bin/env bash
#image_version=`date +%Y%m%d%H%M`;

# 关闭容器
docker-compose stop || true;
# 删除容器
docker-compose down || true;
# 构建镜像
docker-compose build;
# 启动并后台运行
docker-compose up -d;
# 查看日志
docker logs nodejs;
# 对空间进行自动清理
docker system prune -a -f


```

## 开始部署

我们现在 `Jenkins` 创建一个项目：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708adcdfadacec5?w=940&h=565&f=png&s=162635)

指定 `git` 远程仓库地址：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708add2d35d3a59?w=970&h=563&f=png&s=86701)

指定 `Node` 版本和之前所编写的脚本：

![](https://user-gold-cdn.xitu.io/2020/2/28/1708add73660733a?w=991&h=652&f=png&s=101125)

最后我们就可以愉快的 `Build Now` 了

![](https://user-gold-cdn.xitu.io/2020/2/28/1708addb23efaad0?w=1020&h=501&f=png&s=198894)

在这里我选择的是手动构建。其实 `Jenkins` 有很多可配置项，比如自动化构建，大家可以按照上方给出的流程图去完善哦。

## 小结

本篇内容有些多，但我们作为一名开发人员，部署项目上线是我们的必修课，还请大家不畏艰辛，好好学习。