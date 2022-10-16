---
title: PERF EVENT 硬件篇续篇
date: 2022-10-13 10:53:39
---
# PERF EVENT 硬件篇续 -- core/offcore/uncore


## 简介
在上篇中，我们简单介绍 PERF EVENT 如何在硬件层面给予测量性能的能力，在这篇中我们继续针对硬件性能事件的类型做进一步介绍以理清我们日常在沟通中会遇到的一些概念。

在上篇介绍中我们介绍了三种事件捕捉实现

- 通用事件 PMCx & PERFEVETSELx
- 专用事件 FIXED_CTRx & FIXED_CTR_CTRL
- RDT
本片主要针对通用事件进行进一步描述

## 概念
cpu 内部元件是分层次构成的，所以性能事件根据此来进行划分成 core/offcore/uncore 事件

### core
core 即是在系统中查看 /proc/cpuinfo 看到的最小核（逻辑核）

core 事件是最好理解的，即是跟逻辑核完全绑定的事件，如该核运行的 cycle 和 instruction 次数

### offcore
在 cpu 硬件实现上又分逻辑核和物理核，逻辑核即是物理核上进行超线程技术虚拟出来的两个核，实际上他们有一部分资源是共享的，而这部分资源被划分到 offcore

offcore 事件稍微抽象点，它是由两个（或者多个兄弟逻辑核）共享的一些事件，比如访问内存，因为在硬件上它们走的是同一个通道。本质上，它是一个 core 事件，但需要额外配置。

### uncore
在物理核的层面上又有一部分资源是物理核共享的（同时也就是 cpu socket 的概念），比如 LLC 是一个 socket 共享，这部分资源被划分为 uncore。

uncore 较为复杂，它不在是以 core 为视角采集性能事件，而是通过在共享资源如 LLC 的视角对接每个 core 设备时提供各式各样的 Box。再拿 LLC 举例子，LLC 提供若干 CBox 为每个 core 提供服务。因此 uncore 事件要建立在 CBox 元件上。如下图所示



从图中，我们可以看出 CBox 作为独立于 Core 存在的元件，是可以被所有 core 可以访问到的，基于 uncore 事件的采集因此而被全局共享。这也造成了对 uncore 事件采集的复杂度（需要单独指定 CBox）。

## offcore性能事件采集
了解概念后，我们如何去采集 offcore 事件呢？Intel 是否为 offcore 准备单独的计数寄存器和事件配置寄存器来处理 offcore 事件？

实际上，offcore 事件仍然复用通用事件寄存器 PMCx & PERFEVETSELx，但会有一些限制（文章后会提及）。在这个基础上 Intel 在 offcore 上增加了几个（一般是两个，各个架构不同，地址也不同）名为 MSR_OFFCORE_RSPx 的寄存器，它被用来配置你需要采集的 offcore 事件。而在原有的通用事件寄存器中 PERFEVETSELx 永远配置的是相同的 event 和 umask（这两者原本用来指向 core 事件，现在被用来指向 MSR_OFFCORE_RSPx ），因为 MSR_OFFCORE_RSPx 已经帮你定义了你需要采集的事件类型。可能这样说有点不直观，我们来对比下流程

core 事件通用事件寄存器配置流程

1. 选取空闲事件寄存器id （0-3任意），选择0
2. 配置对应的 PERFEVETSEL0，选择 core 事件 L2_RQSTS.ALL_PF，查表找到对应事件的配置，将 event 字段配置成 0x24 umask 字段配置成 0xF8
3. 此时 PMC0 已经开始记录 L2_RQSTS.ALL_PF 事件的次数

offcore 事件通用事件寄存器配置流程

1. 选取空闲事件寄存器id （0-3任意），选择0
2. 选择空闲 MSR_OFFCORE_RSPx 来配置 offcore 事件 （0-1），选择0，其对应的 event 为 0xB7 umask 为 0x01，msr offset 为 0x1a6 （以上信息均查 Intel 手册得到）
3. 配置对应的 PERFEVETSEL0，将 event 字段配置成 0xB7 umask 0x01
4. 将 2 步选择的 MSR_OFFCORE_RSP0 进行配置 （之前只是选择后，配置到 PERFEVETSEL0，并未写入offcore 事件选择 ），配置 OFFCORE_RESPONSE.DEMAND_DATA_RD.L3_MISS.ANY_RESPONSE 事件，查表后得到需要将 0x3fffc00001 写入地址为 0x1a6 的 msr
5. 此时 PMC0 已经开始记录 OFFCORE_RESPONSE.DEMAND_DATA_RD.L3_MISS.ANY_RESPONSE 事件的次数

翻译成 perf 命令行
```
perf stat -e cpu/event=0xB7,umask=0x01,offcore_rsp=0x3fffc00001/ /bin/ls
```
发现该命令行与描述上存在的问题没？

它并没有指定 MSR_OFFCORE_RSP0 的 msr 地址， 经过笔者测试 event & umask 作为选择子 linux 内核会发现 MSR_OFFCORE_RSP 对应 msr 地址，并且很神奇地复用有限的 MSR_OFFCORE_RSPx（上述命令指定 event=0xBB 效果完全一致）。

## offcore 与 core 使用上的差异
offcore 因为需要额外的配置寄存器，一般的 cpu 型号上只有两个，所以在一个物理核上一旦采集超过2个不同的事件，就会发生分时复用。

## uncore性能事件采集
uncore 事件采集的硬件实现与通用实现类似，都是通过一对对事件选择寄存器和事件计数寄存器来实现的。具体细节可查看 Intel 手册，这里不再赘述。

在内核接口上，uncore 性能事件已经不是原本 core 上的 pmu 设备了，所以原有的 perf 接口并不知道用户采集哪个 CBox 上的性能数据，所以 perf_event 在原有的基础上在 type 参数上进行扩展接口（换句话说 uncore 事件都是需要单独的内核驱动的）。

好在内核在 /sys/devices/uncore_*/type 文件直接暴露了该参数，在接口和工具的使用过程中，可以直接读取该文件的值，其余使用方法与 core 事件一致，下面是一个例子
```
perf stat -e "uncore_imc_1/cas_count_read/"  -a ls
```
翻译成 perf_event_open 参数就是
```
type=15,event=0x04,umask=0x03
```
另外，因为 uncore 的独立性也就是所谓 per-socket 事件，采集 uncore 事件要避免相同数据重复采集

## 总结
本篇补全了 cpu 硬件性能事件捕捉机制的在各个层次上的事件类型，实际上本文描述的事件类型外，随着 cpu 架构的发展，Intel 又引入了 RDT 事件类型，虽然他们在软件层面都实现了 perf_event 的接口，但是在硬件层面上截然不同，从硬件实现上去了解各个事件的实现机制可以有效的理解和使用 perf 系统，以掌控系统性能的采集能力。阿里云系统组在性能采集的工作中开发了相关工具，其有效利用内核软件和硬件性能采集机制来为各个业务方提供系统性能数据，同时，降低用户使用 perf 子系统的门槛。

## 其他
PERF_EVENT 系列文章

[PERF EVENT API篇](./perf_api.md)
[PERF EVENT 硬件篇](./perf_hardware.md)
[PERF EVENT 内核篇](./perf_kernel.md)
[PERF EVENT 硬件篇续](./perf_hardware2.md)


参考资料
https://web.eece.maine.edu/~vweaver/projects/perf_events/uncore/offcore_uncore.pdf
