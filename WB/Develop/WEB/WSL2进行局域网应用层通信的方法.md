---
title: 
date: 2024-03-28
tags:
  - Note
draft: false
permalink: /7
comments: true
---
# 配置方法

## 1. 配置防火墙入站规则。

- 打开windows安全中心
- 选择高级设置
- 点击入站规则
- 右边点击新建入站规则
- 选择配置端口入站规则
- 填入开放的端口，如 5901
- 选择开放所有域访问（私有/公用/域都要开放）
- 填入一个名字然后保存：如 publish_bot

## 2. 配置端口转发

查看WSL2的内部IP，在WSL2 内部输入 `ip a l eth0` 查看
使用管理员权限打开 PowerShell 
使用以下命令查看已有的规则
```bash
netsh interface portproxy show all

Listen on ipv4:             Connect to ipv4:

Address         Port        Address         Port
--------------- ----------  --------------- ----------
*               123         172.19.177.2    123
*               5701        172.19.177.2    5701
*               55262       172.19.177.2    55262
```
使用 一个命令进行转发流量配置
```bash
netsh interface portproxy add v4tov4  \
listenport={Windows端口} \
listenaddress={Windows处接收到的流量,注意Windows有多IP} \
connectport={WSL2开启的服务端口, 也就是访问主机的流量要转发到这个WSL2内部的端口} \
connectaddress={WSL2内部通过 ip a l eth0 查看的IP}
```
例子如下：
```bash
netsh interface portproxy add v4tov4  listenport=5701 listenaddress=* connectport=5701 connectaddress=172.19.177.2
```

删除 
```bash
netsh interface portproxy del v4tov4  listenport=8080 listenaddress=*
```

# 调试方法

如果不确定流量到底过没过来，有以下几个工具可以参考

## 数据包分析
 
使用 `wireshark` 或者 `tcpdump` 工具进行抓包分析，查看流量到哪里了

安装
```bash
sudo apt-get install -y tcpdump
```

数据包抓包分析
```bash
sudo tcpdump -i any port 5701 -X -vv
# -X   显示包内容
# -vv  显示详情
# -w   将结果写入文件
```

## 一个简单的服务端搭建

安装
```bash
sudo apt-get install -y netcat
```

使用
```bash
nc -l -p 5701 # 监听 5701 的流量
```
## 一个简单的HTTP客户端的发送

需要注意， 请求 body 的json数据必须是双引号才对，json格式的标准是使用双引号, 单引号会出现其他报错. 可
以先在本机发送，以便确认两个问题
1. 发送端可以发送
2. 接收端可以接收
```bash
curl -X POST -H "Content-Type: application/json" -d '{"name":"John Doe", "age":30}' http://localhost:5701 
# -X  方法
# -H  请求头
# -d  请求的数据
```

如果WSL2本机环境内部可以自己给自己发送并且能接收到的话，至少服务器运行是能收到的，还需要进一步分析。


## Postman 发送局域网包

wsl2 中开启 
```bash
nc -l -p 55262
```
需要使用 `Postman` 发送路由器的ip+端口，比如 192.168.8.104 本机从路由器获取到的ip，
发送数据包到 192.168.8.104:55262里面，看wsl2中是否能收到，确保这个ip能访问通，不然局域网也是无法访问的

特别的，在wsl2开启代理的时候，要设置
```bash
export no_proxy="localhost,127.0.0.1,192.168.*,172.19.*,172.16.*"
```
可以让本地流量不代理
与此同时，
通过 
```bash
unset http_proxy
```

方式可以删除环境变量, 关闭代理.


## 完整的解决方案

wsl2的网络默认是nat，会有很多莫名其面的问题，直接改成镜像可以减去额外配置的问题，修改镜像模式请确保你的wsl2版本为 `2.0.0` 以上。 同时如果你用这两款软件： `VS Code` 和 `Docker` 也需要是新版本(新版本更新了对wsl镜像模式的支持)。

推荐 `.wslconfig` 配置如下, 这个文件一般位置为 `C:\Users\{你的用户名}\.wslconfig`  (.wslconfig不是文件夹)

```ini
[wsl2]

# 开启镜像网络, 解决莫名其妙的wsl2内网访问问题.
# 需要注意的是，[experimental] 不能加到 [wsl2] 的前面
[experimental]
autoMemoryReclaim=gradual # 开启自动回收内存，可在 gradual, dropcache, disabled 之间选择
networkingMode=mirrored # 开启镜像网络
dnsTunneling=true # 开启 DNS Tunneling
firewall=true # 开启 Windows 防火墙
autoProxy=true # 开启自动同步代理
sparseVhd=true # 开启自动释放 WSL2 虚拟硬盘空间
```

修改后需要通过 `PowerShell` 重启 wsl, 最好是重启电脑，因为改了网络配置，很多服务可能会使用旧配置导致运行有各种莫名奇妙的其他问题.

```bash
wsl --shutdown
```

与此同时， 在 wsl2 中要监听 `0.0.0.0` 才能对所有本机ip进行处理，因为一台可能会有多个ip， 只设置 `127.0.0.1`  可能会只有wsl自身才能访问得到. 

> `127.0.0.1` 是一个环回地址。并不表示“本机”。`0.0.0.0`才是真正表示“本网络中的本机”。

在实际应用中，一般我们在服务端绑定端口的时候可以选择绑定到`0.0.0.0`，这样我的服务访问方就可以通过我的多个ip地址访问我的服务。

比如我有一台服务器，一个外放地址A,一个内网地址B，如果我绑定的端口指定了`0.0.0.0`，那么通过内网地址或外网地址都可以访问我的应用。但是如果我之绑定了内网地址，那么通过外网地址就不能访问。 所以如果绑定`0.0.0.0`,也有一定安全隐患，对于只需要内网访问的服务，可以只绑定内网地址。


> 即使是镜像模式也会有windows防火墙

对于需要给局域网访问的流量，也需要通过 入站规则放行才能访问到.

具体配置在本文这里： [[#1. 配置防火墙入站规则。]]

# 碰到的困难点

本次发现的影响的地方有：
1. 防火墙： 局域网流量过来windows后基本都会被防火墙拦了
2. WSL2网络独立： 即使局域网流量能到本机，但是本机的服务是跑在WSL2上的， WSL2有自己的网络， 
	1. 如果和本机重叠的情况下访问本机ip而不是wsl2的ip会优先路由给本机windows服务. 如果直接访问ip的话就没有优先级限制能直接访问到。 
	2. windows端没有开启相同端口的服务的话，可以配置端口转发而不用担心端口冲突，端口转发其实也是用一个具有端口转发的程序实现的，因此要专门的执行他的配置命令，好让他能帮忙把路由到Windows 的流量转发到WSL2虚拟设备上。
3. 手机端的 `Shamrock` 经验证发现不支持动态修改配置，每次都要重新强制停止QQ才可能生效，为此前期丢失了很多关健信息。
	1.  `Shamrock` 要工作在 HTTP 流量转发、 开启CQ码的情况下，强制重启QQ，就能完美兼容 `OneBot` 机器人， `OneBot`是一种聊天机器人协议。


# 通用规范化协议的好处

`OneBot`聊天机器人协议规定了怎么处理数据，给定了怎么发送数据和接收数据的接口定义和数据结构定义，照着这个标准开发之后，就能和使用同样标准的其他组件进行兼容协议版本通信，相当于只需要适配协议后，遵循协议的所有功能都是通用的，相当于写一份代码就能支持不同的组件。
她像是一种API的定义，属于设计阶段产出的结构输入输出数据的标准化定义，协议就是能够规范化程序，这样子的话就能只写一份代码旧长期让程序生命周期延长下去。

这也是设计文档的一种通用化表达，他就像是一种语言，学习得到这个版本的协议，并遵循协议，就能够开发出非常庞大的项目。 其他人也可以遵循协议加入开发，不只是仅仅自己一个人进行开发，给出标准化定义后，就能将各个功能划分给不同的人一起实现，提高整体的效率。避免了不同开发人员写不一样的代码，最后适配不同应用的时候又要花费大量的时间去重新适配代码。影响人力物力财力、也浪费了时间，导致了重复作业。从集体的角度上来看，是属于多种人实现同一种功能，是集体意义上的返工，非常消耗生命力。相当于只要干一份工就能让这份力量长期发挥作用。使用通用标准的话，还减少了新的适配投入的精力，实现能力 #堆叠 化的发展，让之后的自己可以享受到现在的自己的工作内容。而不需要重新适配、不需要完全重新开发。只需要花较少的力量去查看自己用到的协议标准的那一部分，就能快速解决现在碰到的问题。

实际上这个`OneBot`协议就像是语言一样，标准化规定了协议中规定的对象（机器人Bot）之间的交互方式，相当于在一个已经兼容协议的社群中，每有新的Bot学习这个协议（就像是语言），就能一起对话，实现功能化的拓展。




[*****](WB/Develop/WEB/WEB.md)
