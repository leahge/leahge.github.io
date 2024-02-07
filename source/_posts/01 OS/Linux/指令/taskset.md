---
title: taskset
date: 2024-01-23 12:23:34
tags:
---

命令安装
----

```shell
yum install util-linux -y
```

命令格式
----

```shell
语法格式：taskset [options] -p [mask] pid
参数选项：
-a, --all-tasks 操作所有的任务线程
-p, --pid 操作已存在的pid
-c, --cpu-list 通过列表显示方式设置CPU（逗号相隔）
-V, --version 输出版本信息
```

 taskset用来查看和设定“CPU亲和力”，说白了就是查看或者配置进程和cpu的绑定关系，让某进程在指定的CPU核上运行，即是“绑核”。

**taskset的用法**

1）显示进程运行的CPU

**taskset -p pid**

 注意，此命令返回的是十六进制的，转换成二进制后，每一位对应一个逻辑CPU，低位是0号CPU，依次类推。如果每个位置上是1，表示该进程绑定了该CPU。例如，0101就表示进程绑定在了0号和3号逻辑CPU上了

**tasket -cp pid**

同上，但显示的是cpu list

2）绑核设定

           taskset -pc 3  pid    表示将进程pid绑定到第3个核上（注：不用将3弄成二进制的）

           taskset -c 3 command   表示执行command命令，并将command启动的进程绑定到第3个核上。