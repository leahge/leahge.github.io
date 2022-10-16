---
title: PERF EVENT 内核篇
date: 2022-10-13 20:18:51
tags:
---
# PERF EVENT 内核篇

简介
本文将以 X86 硬件事件为入手点，介绍 linux kernel 中 perf_event 子系统的部分实现，通过本文读者将初步了解到 perf_event 资源是如何在内核中呈现，运行，会依次如何对硬件进行操作，如何产生分时复用，以及在软件层面如何产生影响

注：阅读本文前需要对 perf_event api 和 perf 硬件有所了解

## 内核数据结构实现
perf_event

代表一种事件资源，用户态调用 perf_open_event 即会创建一个与之对应的 perf_event 对象，相应的一些重要数据都会以这个数据结构为维度存放 包含 pmu ctx enabled_time running_time count 等信息

pmu

代表一种抽象的软硬件操作单元，它可以是 cpu，software，在 cpu 的实现下，它负责对硬件 PMC/PERFEVTSEL/FIXED_CTR/FIXED_CTR_CTRL 进行操作。每一种厂商在内核实现的 pmu 是不同的。在内核中 PMCx 与 PERFEVTSELx 属于 cpu pmu，而 RDT 属于 intel_cqm pmu

pmu 包含一系列方法（以 perf_event 为输入参数），用于 初始化/关闭/读取 硬件pmu设备，cpu 就是一个 pmu，这一个对象包含了所有的 cpu 硬件事件。它是一个类对象（可以认为是单例实现），全局共享，由 attr.type 来定位，开机时内核会注册一系列（arch/x86/kernel/cpu/perf_event.c）pmu 放置 pmu_idr 中

它会实现一系列对硬件操作和状态管理函数，如enable，disable，add，del。同时分时复用的一些分配通用 pmc 的逻辑也在里面

perf_event_context

代表 perf_event 和 pmu 的一种抽象，它会包含 perf_event_list 和 pmu。是 perf_event 子系统操作的最小单元。它会被包含在 task 或 cpu 结构中，这样一来与其他子系统如 sched 产生协作

perf_event_context 是 perf_event 的一个 container, 以列表的方式维护多个perf_event对象，ctx 包含 perf_event 后以 task 和 cpu 两个维度维护，per-cpu 对象中会包含 context（当指定 per-cpu event的时候，会alloc context 并赋值到p er-cpu 数组中），同样 task 的结构对象中也会包含 context，这两者用sched_switch 时会判断 context 中的内容作出决定

## 事件作用域
perf_event 系统调用中提供两种维度的作用域

1. task
2. cpu

在内核中将 event 分为 per-task 和 per-cpu, 还有一种 per-cgroup，它实际上是 per-task 类型的

如果是 per-task 它会将 perf_context 分配到 task struct 中

如果是 per-cpu 它会将 perf_context 分配到一个全局 per_cpu 变量中

## 内核系统调用实现
系统开机时会通过 cpuid 汇编指令获取 pmu 硬件信息，初始化和注册 pmu 对象
arch/x86/kernel/cpu/perf_event.c
```
perf_pmu_register(&pmu, "cpu", PERF_TYPE_RAW);
```
会将所有扫描到的 pmu 对象放到字典对象 pmus 中，以便后续用户调用 perf_event_open 中定位 pmu

perf_event_open 实现源码 (kernel/events/core.c)

1. 为调用者创建句柄资源
2. 根据用户参数 attr，定位 pmu 对象，通过 pmu 初始化event
3. 根据作用域创建相应的 perf_context
4. 将回调函数和相关的数据资源绑定到句柄中

## 内核操作硬件 —— 事件激活
内核中定义了两个重要的 pmu 操作函数

- perf_pmu_enable
- perf_pmu_disable

我们可以理解这两个函数是用于事物提交，也就是最终生效的函数

我们先撇开per-task per-cpu， 只说说当用户在一个cpu上定义了一个event时的逻辑

内核先会以 event_context 维度处理一些逻辑，暂放不表，直接进入 event_sched_in 函数，这个函数会调用 pmu->add （pmu 里面包含一个 x86_pmu 里面有 per-cpu 的全局对象了，它包含这个cpu的所有event。下面我们就称之为pmu）， 它做了以下事情

1. 将 perf_event 对象添加到生效列表
2. 同时为它分配一个具体的 PMC 硬件 （敲黑板！！）

注：还记得在 PERF EVENT 硬件篇 中描述的那几个MSR/PMC么？步骤2中就会对那几个硬件的状态进行判断，然后分配一个硬件给event，并记录在event->hw结构中

此时硬件层面并没有任何事件生效的动作，只要内核真正调用了 perf_pmu_enable 后才会根据 pmu 对象中的 event_list 遍历操作对应 pmc 设备

## 内核操作硬件 —— 事件计数读取
同样类似事件激活的过程，pmu 从 event_list 中遍历出 pmc 设备的地址，通过 rdpmc 指令读取出计数，然后记录在 event->count 中，同时也会记录运行的时间戳

## 性能负载
除了功能以外，用户最关心的就是性能了，同样 perf_event 的性能开销是尤其重要的一个点，好在该子系统代码结构良好，从源代码中就可以分析出一定的性能开销

注：本系列只针对 cpu 硬件事件

由于 PMC 是硬件实现的，它本身的硬件开销我们只能通过黑盒测试进行判断，但好在硬件强大，对单一 event 的测试过程中，没有肉眼可发现的性能开销，下面我们内核软件层面的开销进行分析。主要有以下几个点会引发性能开销

1. per-task 进程切换导致的硬件状态读取和修改
2. 时钟中断导致的硬件读取和修改
其实，以上两者都是对硬件操作产生的开销，不同在于产生的入口不同，比如读取 perf_event 的数值也会产生对硬件操作，但是这个毕竟不是频繁操作，我们就不讨论了。

per-task 故名思义，它是以 task 为维度定义的 event， 如 进程a 要开启事件a的计数，进程b 要开启 事件a 和 事件c，当 进程a 切换到 进程b 时要做如下操作

1. 读取进程a 的事件a 状态，并计入到对应的 event 对象中
2. 关闭进程a 的所有事件的硬件激活状态
3. 激活进程b 的事件a 和 事件c
以上操作要操作若干次硬件，然后硬件是同步操作，会引发cpu stall。而且从代码上来看，会比理论上操作硬件次数多的多。通过构造一个频繁进行上下文切换的测试，最多可造成50%性能损失

所以说，per-task 在依照进程状态的情况下，可能对性能造成不同程度的影响，但从直观的角度来说，是不建议使用的。但是有一个例外，就是在进程fork大量的子进程前就对该进程进行事件监控，perf_event 会感知到子进程为父进程的同类进程，而不操作硬件，大大降低了性能开销


之前也说过 per-cgroup 是通过 per-task 来实现的，那么 per-cgroup 的性能如何？per-cpu 的性能又是怎样的呢？

其实，上面针对 per-task 的特例已经回答了！

我们再来说说时钟中断导致的硬件读取和修改。为何这里会引入一个时钟中断？

我们来回忆一下 PMC 的硬件个数，每个cpu 是4个通用PMC（关虚拟化则是8个）3个专用 pmc，这三个分别记录其固定事件

所以，一个事件至多在一个cpu上能同时激活5个。如果，我们定义了6个，那么内核就会机智地帮我们处理分时复用（multiplexing）的问题。也就是说，如果是10个事件，每个事件会运行50%的事件，而这个切换过程由时钟中断来触发，一毫秒触发一次。这个次数跟 per-task 的进程切换相比会低上很多。这个开销大约在每CPU 2%左右

相关资料
http://openlab.cern/sites/openlab.web.cern.ch/files/technical_documents/TheOverheadOfProfilingUsingPMUhardwareCounters.pdf
