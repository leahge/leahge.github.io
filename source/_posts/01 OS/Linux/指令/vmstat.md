---
title: vmstat-Report virtual memory statistics
date: 2022-10-13 20:18:51
tags:
---
<a href="https://man7.org/linux/man-pages/man8/vmstat.8.html">https://man7.org/linux/man-pages/man8/vmstat.8.html</a>
vmstat命令是最常见的Linux/Unix监控工具，可以展现给定时间间隔的服务器的状态值,包括服务器的CPU使用率，内存使用，虚拟内存交换情况,IO读写情况。这个命令是我查看Linux/Unix最喜爱的命令，一个是Linux/Unix都支持，二是相比top，我可以看到整个机器的CPU,内存,IO的使用情况，而不是单单看到各个进程的CPU使用率和内存使用率(使用场景不一样)。
```
Synopsis

vmstat [-a] [-n] [-t] [-S unit] [delay [ count]]
vmstat [-s] [-n] [-S unit]
vmstat [-m] [-n] [delay [ count]]
vmstat [-d] [-n] [delay [ count]]
vmstat [-p disk partition] [-n] [delay [ count]]
vmstat [-f]
vmstat [-V]
```

一般vmstat工具的使用是通过两个数字参数来完成的，第一个参数是采样的时间间隔数，单位是秒，第二个参数是采样的次数

选项参数:

      1) -d:　　　　　　　　显示磁盘相关统计信息。

      2) -a：　　　　　　    显示活跃和非活跃内存

      3) -f：　　　　　　　  显示从系统启动至今的fork数量。

      4) -p：　　　　　　    显示指定磁盘分区统计信息

      5) -s：　　　　　　    显示内存相关统计信息及多种系统活动数量。

      6) -m：　　　　　　  显示slabinfo

字段的含义

r 表示运行队列(就是说多少个进程真的分配到CPU)，我测试的服务器目前CPU比较空闲，没什么程序在跑，当这个值超过了CPU数目，就会出现CPU瓶颈了。这个也和top的负载有关系，一般负载超过了3就比较高，超过了5就高，超过了10就不正常了，服务器的状态很危险。top的负载类似每秒的运行队列。如果运行队列过大，表示你的CPU很繁忙，一般会造成CPU使用率很高。

b 表示阻塞的进程

swpd 虚拟内存已使用的大小，如果大于0，表示你的机器物理内存不足了，如果不是程序内存泄露的原因，那么你该升级内存了或者把耗内存的任务迁移到其他机器。

free   空闲的物理内存的大小

buff   Linux/Unix系统是用来存储，目录里面有什么内容，权限等的缓存

cache cache直接用来记忆我们打开的文件,给文件做缓冲

si  每秒从磁盘读入虚拟内存的大小，如果这个值大于0，表示物理内存不够用或者内存泄露了，要查找耗内存进程解决掉。

so  每秒虚拟内存写入磁盘的大小，如果这个值大于0，同上

bi  块设备每秒接收的块数量，这里的块设备是指系统上所有的磁盘和其他块设备，默认块大小是1024byte

bo 块设备每秒发送的块数量，例如我们读取文件，bo就要大于0。bi和bo一般都要接近0，不然就是IO过于频繁，需要调整。

in 每秒CPU的中断次数，包括时间中断

cs 每秒上下文切换次数

us 用户CPU时间

sy 系统CPU时间，如果太高，表示系统调用时间长，例如是IO操作频繁。

id  空闲 CPU时间

wa 等待IO CPU时间。IO等待时间百分比 wa的值高时，说明IO等待比较严重，这可能由于磁盘大量作随机访问造成，也有可能磁盘出现瓶颈（块操作）

st:来自于一个虚拟机偷取的CPU时间的百分比
