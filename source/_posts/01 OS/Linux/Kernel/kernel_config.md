---
title: linux kernel 编译选项
date: 2022-10-31 13:53:57
tags:
---
有时候我们需要查看Linux系统的内核是否在编译的时候的编译选项，从而确定某个模块是否已经加入到内核以及参数设置等等。

方法有两种：

```
# zcat /proc/config.gz

# cat /boot/config-$(uname -r)
```

第一种方法要求在内核编译时增减相应的选项才会生成，很多系统找不到/proc/config.gz这个文件。不过第二种方法通常不会遇到什么问题。准确的说，这两个文件就是内核编译使使用的config文件。

比如查看bcache是否编译进了内核：

```
# cat /boot/config-$(uname -r) | grep BCACHE
```

Ubuntu除以上外，还可以：

1. 文件下查看
   /usr/src/linux-headers-$(version)-generic/.config

Redhat 除以上外，还可以从系统/usr/src/kernel目录下获取

```csharp
[root@localhost ~]# uname -r
4.9.77
[root@localhost ~]# cd /usr/src/kernels
[root@localhost kernels]# ls
4.9.77-30.el7.x86_64
[root@localhost kernels]# cd 4.9.77-30.el7.x86_64/
[root@localhost 4.9.77-30.el7.x86_64]# ls -a
.     block   .config      drivers   include  Kconfig  Makefile        net      security    tools
..    certs   .config.old  firmware  init     kernel   mm              samples  sound       usr
arch  config  crypto       fs        ipc      lib      Module.symvers  scripts  System.map  virt
```

如上所示，当前内核的编译配置文件为：.config
