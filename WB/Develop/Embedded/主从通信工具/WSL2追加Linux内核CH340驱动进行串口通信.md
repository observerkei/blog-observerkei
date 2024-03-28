# `CH340` 简介

`CH340`是具有`USB总线`转`串口通信`功能的低成本通信芯片。

## `CH340` 资料下载

技术手册： [CH340DS1.PDF](https://www.wch.cn/downloads/CH340DS1_PDF.html)
Linux驱动：[CH341SER\_LINUX.ZIP](https://www.wch.cn/download/CH341SER_LINUX_ZIP.html)
PCB设计资料：[CH340PCB.ZIP](https://www.wch.cn/downloads/CH340PCB_ZIP.html)


# `WSL2` 内核编译

## 内核源码下载

```bash
git clone https://github.com/microsoft/WSL2-Linux-Kernel
cd WSL2-Linux-Kernel
```

## 安装编译依赖

```bash
sudo apt install build-essential flex bison dwarves libssl-dev libelf-dev
```

## 添加`CH340`驱动

```bash
make menuconfig KCONFIG_CONFIG=Microsoft/config-wsl
```

* 找到 `Device Drivers  --->` 
* `->` `USB support  ---> ` 
* `->` `USB Serial Converter support` 选项, 按下`y`选中,
* 变成 `<*>   USB Serial Converter support` ，然后一直返回然后保存即可。


## 编译

```bash
make KCONFIG_CONFIG=Microsoft/config-wsl -j
# -j 后面接自己CPU核心数-2 进行编译
# 编译好后 内核文件根据日志, 文件在 arch/x86/boot/bzImage 

# 安装模块
sudo make modules_install

# 检查模块依赖
sudo depmod -a
```

## 如果没有找到驱动

下载`CH340`驱动文件： [CH341SER\_LINUX.ZIP - 南京沁恒微电子股份有限公司](https://www.wch.cn/download/CH341SER_LINUX_ZIP.html)
以及`WSL2`内核： [GitHub - microsoft/WSL2-Linux-Kernel: The source for the Linux kernel used in Windows Subsystem for Linux 2 (WSL2)](https://github.com/microsoft/WSL2-Linux-Kernel)
参考这个教程： [Linux驱动实践：带你一步一步编译内核驱动程序 - IOT物联网小镇 - 博客园](https://www.cnblogs.com/sewain/p/15565443.html)
自行进行内核编译，将含有 `CH340` 内核编译好后继续.

## 启用内核

把编译好的内核拷贝到一个目录中

```bash
mkdir -p /mnt/c/APP/WSL2/
# 在内核编译好后的目录执行
cp arch/x86/boot/bzImage /mnt/c/APP/WSL2/
```

配置 `C:/User/{你的用户名}/.wslconfig` (替换你的用户名, 没有就新建一个):
指定内核位置, 注意 `\` 目录分隔符是两个杠 `\\` 

```ini
[wsl2]
kernel=C:\\APP\\WSL2\\bzImage
```

然后在`Windows`的命令行中关闭`WSL2`，再重新进入`WSL2`即可

```bash
wsl --shutdown
```

在`WSL2`中执行命令查看内核是否启用成功
```bash
uname -a
Linux O 5.15.150.1-microsoft-standard-WSL2 #1 SMP Wed Mar 27 06:07:03 CST 2024 x86_64 x86_64 x86_64 GNU/Linux
```

## 挂载驱动

```bash
sudo modprobe ch341

# 查看是否挂载成功
sudo lsmod
Module   Size  Used by
ch341    20480  1  
```

### 如果你想通过文件挂载

回到刚刚编译内核的目录，可以手动挂载驱动

```shell
sudo insmod drivers/usb/serial/ch341.ko

# 查看是否挂载成功
sudo lsmod
Module   Size  Used by
ch341    20480  1  
```


# Windows usbipd 设备共享

## Install & Update `usbipd`

```shell
winget uninstall usbipd
winget install usbipd
```

## 查看USB设备

```shell
usbipd list
Connected:
BUSID  VID:PID    DEVICE                   STATE
6-3    1a86:7523  USB-SERIAL CH340 (COM6)  Not shared
6-5    045e:09ac  USB Input Device         Not shared
Persisted:
GUID              DEVICE
```

## 共享USB设备

比如发现 `CH340` 设备的 `BUSID` 是 `6-3` ，则用以下命令共享

```shell
# 设置共享
usbipd bind --busid 6-3 

# 链接设备到 WSL2 中
usbipd attach --wsl --busid 6-3 

# 查看共享状态
usbipd list
Connected:
BUSID  VID:PID    DEVICE                   STATE
6-3    1a86:7523  USB-SERIAL CH340 (COM6)  Attached
6-5    045e:09ac  USB Input Device         Not shared
Persisted:
GUID              DEVICE
```


# `WSL2` `CH340` 挂载和连接

## 查看挂载

前面`Windows`共享设备成功后，在`WSL2`中查看设备是否成功挂载：

```bash
lsusb
Bus 002 Device 001: ID XXXX:0001 Linux **********
Bus 001 Device 003: ID XXXX:0002 QinHeng Electronics CH340 serial converter
```

查看设备挂载到的位置, 发现是 `ttyUSB0` 也就是 `/dev/ttyUSB0`

```bash
dmesg | grep ch34
usbcore: registered new interface driver ch341
usbserial: USB Serial support registered for ch341-uart
ch341 1-1:1.0: ch341-uart converter detected
usb 1-1: ch341-uart converter now attached to ttyUSB0 
```


# 连接`CH340`设备

## 安装 串口连接工具 `minicom`

```bash
sudo apt-get install -y minicom
```

## 连接设备

配置连接信息

```bash
minicom -s
# 选中 Serial port setup
# 按下 A 可以修改设备文件, 将 A - Serial Device: 成为 刚刚挂载CH340的文件, 比如 /dev/ttyUSB0 , 记得点击保存
# 按下 E 可以修改波特率，要确保波特率正确, 如 E - Bps/Par/Bits: 115200 8N1 
```

修改完成返回后重进一下，看下是不是真的修改成功了，然后再次进入终端

```bash
minicom
```

配置完成后即可连接的设备，比如连接的设备信息可能如下：

```shell
 __  __       _       ____
|  \/  | __ _(_)_  __/ ___|  ___ _ __  ___  ___
| |\/| |/ _` | \ \/ /\___ \ / _ \ '_ \/ __|/ _ \
| |  | | (_| | |>  <  ___) |  __/ | | \__ \  __/
|_|  |_|\__,_|_/_/\_\|____/ \___|_| |_|___/\___|

Welcome to Armbian 21.08.0-trunk Bullseye with bleeding edge Linux 5.14.0-rc7-sun50iw11

No end-user support: built from trunk & unsupported (bullseye) userspace!

System load:   111%             Up time:       2 min
Memory usage:  42% of 231M      Zram usage:    11% of 115M      IP:
CPU temp:      58°C             Usage of /:    79% of 2.9G

Last login: Thu Mar  2 09:25:02 UTC 2023 on ttyS0  
root@maixsense:~# 
```


## 断开设备

直接拔线或者执行

```bash
usbipd detach --busid <busid>
```

> 更多 `usbipd` 使用教程: [连接 USB 设备 | Microsoft Learn](https://learn.microsoft.com/zh-cn/windows/wsl/connect-usb#attach-a-usb-device)


[*****](WB/Develop/Embedded/主从通信工具/主从通信工具.md)
