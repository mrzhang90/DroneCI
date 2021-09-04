## 上线
node scripts/deploy.js test01

## Drone 流程：

1. Github repo

- Push 代码时，推动到 Drone server master 远程服务器

2. Drone server master

- 把任务写到 Drone server 数据库(Databse)

3. Drone agent（代理服务器）

- 代理服务器监听到数据库变化，代理服务器通过 RPC 把任务发给 Drone server master
- 代理服务器可以有多台

PS:一个 Drone 服务器只能对象一个 git 代码源
