---
title: PMU计数器
date: 2022-10-28 14:23:03
tags:
---
task-clock：任务真正占用的处理器时间，单位为ms。CPUs utilized = task-clock / time elapsed，CPU的占用率。

context-switches：上下文的切换次数。

CPU-migrations：处理器迁移次数。Linux为了维持多个处理器的负载均衡，在特定条件下会将某个任务从一个CPU迁移到另一个CPU。

page-faults：缺页异常的次数。当应用程序请求的页面尚未建立、请求的页面不在内存中，或者请求的页面虽然在内存中，但物理地址和虚拟地址的映射关系尚未建立时，都会触发一次缺页异常。另外TLB不命中，页面访问权限不匹配等情况也会触发缺页异常。

cycles：

stalled-cycles-frontend：略过。

stalled-cycles-backend：略过。

instructions：执行了多少条指令。IPC为平均每个cpu cycle执行了多少条指令。

branches：遇到的分支指令数。branch-misses是预测错误的分支指令数。

cpu-cycles：某段时间内的CPU cycle数 （硬件事件）。如果把被ls使用的cpu cycles看成是一个处理器的，那么它的主频为2.486GHz。可以用cycles / task-clock算出。

cpu-clock：某段时间内的cpu时钟数；

CPU cycles事件和cpu-clock事件因比较常用，我们说一下它们的区别：
cpu-clock可以用来表示程序执行经过的真实时间，而无论CPU处于什么状态（Pn（n非0）或者是C状态）；
而CPU cycles则用来表示执行程序指令花费的时钟周期数，如果CPU处于Pn（n非0）或者是C状态，则cycles的产生速度会减慢。
也即，如果你想查看哪些代码消耗的真实时间多，则可以使用cpu-clock事件；而如果你想查看哪些代码消耗的时钟周期多，则可以使用CPU cycles事件。
