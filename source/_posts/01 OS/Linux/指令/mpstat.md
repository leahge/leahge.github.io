---
title: mpstat-Multiprocessor Statistics
date: 2022-10-13 20:18:51
tags:
---
mpstat是Multiprocessor Statistics的缩写，是实时监控工具，报告与cpu的一些统计信息这些信息都存在/proc/stat文件中，在多CPU系统里，其不但能查看所有的CPU的平均状况的信息，而且能够有查看特定的cpu信息，mpstat最大的特点是:可以查看多核心的cpu中每个计算核心的统计数据；而且类似工具vmstat只能查看系统的整体cpu情况。

mpstat的语法如下

mpstat [-P {cpu|ALL}] [internal [count]]
其中，各参数含义如下：

参数
	含义
-P {cpu l ALL}		表示监控哪个CPU， cpu在[0,cpu个数-1]中取值
internal	相邻的两次采样的间隔时间
count	采样的次数，count只能和delay一起使用
字段的含义

%user      在internal时间段里，用户态的CPU时间(%)，不包含nice值为负进程  (usr/total)*100

%nice      在internal时间段里，nice值为负进程的CPU时间(%)   (nice/total)*100

%sys       在internal时间段里，内核时间(%)       (system/total)*100

%iowait    在internal时间段里，硬盘IO等待时间(%) (iowait/total)*100

%irq         在internal时间段里，硬中断时间(%)     (irq/total)*100

%soft       在internal时间段里，软中断时间(%)     (softirq/total)*100

%idle       在internal时间段里，CPU除去等待磁盘IO操作外的因为任何原因而空闲的时间闲置时间(%) (idle/total)*100

Note：

1.vmstat和mpstat 命令的差别：mpstat 可以显示每个处理器的统计，而 vmstat 显示所有处理器的统计。因此，编写糟糕的应用程序（不使用多线程体系结构）可能会运行在一个多处理器机器上，而不使用所有处理器。从而导致一个 CPU 过载，而其他 CPU 却很空闲。通过 mpstat 可以轻松诊断这些类型的问题。

2.vmstat中所有关于CPU的总结都适合mpstat。当您看到较低的 %idle 数字时，您知道出现了 CPU 不足的问题。当您看到较高的 %iowait 数字时，您知道在当前负载下 I/O 子系统出现了某些问题。
