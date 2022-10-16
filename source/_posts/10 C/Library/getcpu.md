---
title: getcpu系统调用
date: 2022-10-16 20:25:36
tags:
---
# getcpu系统调用

**名称：**
getcpu - 确定调用线程正在运行的CPU和NUMA节点

**概要：**
```
#include <linux/getcpu.h>

int getcpu(unsigned *cpu, unsigned *node, struct getcpu_cache *tcache);

注意：这个系统调用没有glibc包装。 见注意事项。
```
**描述：**

getcpu（）系统调用标识调用线程或进程当前正在运行的处理器和节点，并将它们写入由cpu和node参数指向的整数。处理器是识别CPU的唯一小整数。该节点是标识NUMA节点的唯一小标识符。当cpu或节点为NULL时，没有任何内容写入相应的指针。

这个系统调用的第三个参数现在是未使用的，应该指定为NULL，除非需要可移植到Linux 2.6.23或更早版本（请参阅NOTES）。

保存在cpu中的信息仅在调用时保持为当前状态：除非使用sched_setaffinity（2）修复了CPU关联性，否则内核可能随时更改CPU。（通常情况下不会发生这种情况，因为调度器会尽量减少CPU之间的移动来保持缓存热度，但这是可能的。）调用者必须允许在调用返回时，在cpu和node中返回的信息不再是当前的。

**返回值：**

成功时返回0。 出错时，返回-1，并适当地设置errno。

**出错值：**

EFAULT参数指向调用进程的地址空间之外

**版本号：**

getcpu（）被添加到x86_64和i386的内核2.6.19中。

**遵守：**

getcpu（）是Linux特有的。

**注意：**

Linux尽最大努力使这个调用尽可能快。getcpu（）的意图是允许程序根据CPU数据或NUMA优化进行优化。

Glibc不提供这个系统调用的包装器; 使用syscall（2）调用它; 或者改为使用sched_getcpu（3）。

自Linux 2.6.24以来，tcache参数未被使用。在较早的内核中，如果这个参数是非空的，那么它指定一个指向线程本地存储器中被调用的缓冲区的指针，该指针用于为getcpu（）提供一个缓存机制。使用缓存可以加速getcpu（）调用，代价是返回的信息过期的可能性很小。在CPU之间迁移线程时，认为缓存机制会导致问题，因此现在忽略该参数。

**查看：**

mbind(2), sched_setaffinity(2), set_mempolicy(2), sched_getcpu(3),

cpuset(7), vdso(7)

**事例：**
```
define _GNU_SOURCE

#include <unistd.h>
#include <sys/syscall.h>
#include <stdio.h>

struct getcpu_cache
{
        unsigned long blob[128/sizeof(long)];
};

int getcpu(unsigned *cpu,unsigned *node,struct getcpu_cache *tcache)
{

        return syscall(SYS_getcpu,cpu,node,tcache);
}

int main(void)
{
        unsigned cpu;
        unsigned node;

        if(getcpu(&cpu,&node,NULL)==-1)
        {
                printf("getcpu bad \n");
                return 1;
        }

        printf("cpu = %u node = %u\n",cpu,node);

        return 0;
}
```
**输出：**
```
pi@ubuntu:~/file$ ./a.out
cpu = 0 node = 0
pi@ubuntu:~/file$ ./a.out
cpu = 3 node = 0
pi@ubuntu:~/file$ ./a.out
cpu = 2 node = 0
pi@ubuntu:~/file$ ./a.out
cpu = 2 node = 0
pi@ubuntu:~/file$ ./a.out
cpu = 2 node = 0
pi@ubuntu:~/file$ ./a.out
cpu = 1 node = 0
```
